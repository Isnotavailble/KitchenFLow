package com.anyawalker.poskds.features.order;

import com.anyawalker.poskds.features.order.dtos.*;
import com.anyawalker.poskds.features.order.exceptions.AlreadyUpdatedException;
import com.anyawalker.poskds.features.order.exceptions.InValidOrderStatusException;
import com.anyawalker.poskds.features.order.exceptions.OrderFailureException;
import com.anyawalker.poskds.features.order.dtos.OrderStatus;
import com.anyawalker.poskds.features.order.mappers.OrderMapper;
import com.anyawalker.poskds.models.MenuEntity;
import com.anyawalker.poskds.models.OrderEntity;
import com.anyawalker.poskds.models.OrderItemEntity;
import com.anyawalker.poskds.models.UserEntity;
import com.anyawalker.poskds.repos.MenuRepo;
import com.anyawalker.poskds.repos.OrderRepo;
import com.anyawalker.poskds.repos.UserRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepo orderRepo;
    private final UserRepo userRepo;
    private final MenuRepo menuRepo;
    private final OrderMapper orderMapper;

    public OrderService(OrderRepo orderRepo,
                        UserRepo userRepo,
                        MenuRepo menuRepo,
                        OrderMapper orderMapper) {
        this.orderRepo = orderRepo;
        this.userRepo = userRepo;
        this.menuRepo = menuRepo;
        this.orderMapper = orderMapper;
    }

    public List<OrderResponse> viewAllOrders() {

        return orderRepo.findAll()
                .stream()
                .map(order -> orderMapper.toResponseDTO(order,""))
                .toList();
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest orderRequest, Long userId) {


        List<OrderItemRequest> nonNullOrderItemList = orderRequest.orderItems()
                .stream()
                .filter(orderItemRequest -> orderItemRequest.quantity() > 0)
                .toList();
        //check null before any db call
        if (nonNullOrderItemList.isEmpty())
            throw new OrderFailureException("Order has no order items.");

        UserEntity orderCreator = userRepo.findById(userId)
                .orElseThrow(() -> new OrderFailureException("Could not create the order due to invalid user id"));


        OrderEntity order = new OrderEntity();
        order.setUserEntity(orderCreator);
        order.setStatus(OrderStatus.WAITING.getValue());
        //extract all menu id
        List<Integer> menuEntityIds = orderRequest.orderItems()
                .stream()
                .map(OrderItemRequest::menuId)
                .distinct()
                .toList();

        List<MenuEntity> unavailable = menuRepo.findAllByIdInAndIsDeletedTrue(menuEntityIds);
        if (!unavailable.isEmpty()){
            String unavailableIdList = unavailable.stream().map(MenuEntity::getId).toList().toString();
            throw new OrderFailureException("Menu with Id %s is not available".formatted(unavailableIdList));
        }

        Map<Integer, MenuEntity> menuEntityMap = menuRepo.findAllByIdInAndIsDeletedFalse(menuEntityIds)
                .stream()
                .collect(Collectors.toMap(MenuEntity::getId,menuEntity -> menuEntity));

        //orderItemRequest -> orderItemEntity mapping process
        AtomicInteger totalPriceBeforeTax = new AtomicInteger();
        int totalPriceAfterTax;
        int taxAmount;
        double taxRate = 0.05;

        List<OrderItemEntity> orderItemList = nonNullOrderItemList
                .stream()
                .filter(orderItemRequest -> orderItemRequest.quantity() > 0)
                .map(orderItemRequest -> {

                    MenuEntity menuEntity = menuEntityMap.get(orderItemRequest.menuId());

                    if (menuEntity == null)
                        throw new OrderFailureException("Could not create the order due to invalid menu_id with " +
                                orderItemRequest.menuId());

                    int itemTotalPrice = orderItemRequest.quantity() * menuEntity.getPrice();
                    totalPriceBeforeTax.addAndGet(itemTotalPrice);

                    OrderItemEntity orderItem = new OrderItemEntity();
                    orderItem.setMenuEntity(menuEntity);
                    orderItem.setUnitPrice(menuEntity.getPrice());
                    orderItem.setQuantity(orderItemRequest.quantity());
                    orderItem.setOrderEntity(order);
                    return orderItem;
                })
                .toList();

        taxAmount = (int) Math.round(totalPriceBeforeTax.get() * taxRate);
        totalPriceAfterTax = totalPriceBeforeTax.get() + taxAmount;

        String orderWorkloadTier = calculateWorkloadTier(orderItemList);
        order.setOrderItemEntityList(orderItemList);
        order.setSubtotalPrice(totalPriceBeforeTax.get());
        order.setTaxAmount(taxAmount);
        order.setTotalPrice(totalPriceAfterTax);
        order.setOrderNumber(generateOrderNumber());
        order.setOrderWorkloadTier(orderWorkloadTier);
        OrderEntity savedOrder = orderRepo.save(order);

        return orderMapper.toResponseDTO(savedOrder,"order created successfully");
    }

    @Transactional
    public OrderResponse updateOrderItems(Integer orderId,
                                          List<OrderItemUpdateRequest> orderItemUpdateRequests,
                                          Long userId) {

        OrderEntity orderEntity = orderRepo.
                findByIdAndUserEntity_Id(orderId, userId)
                .orElseThrow(() -> new OrderFailureException("Order doesn't exist"));


        if (!orderEntity.getStatus().equals(OrderStatus.WAITING.getValue()))
            throw new OrderFailureException("Cannot update due to order status " +
                    orderEntity.getStatus() +
                    ".Can only update while waiting");
        //Map<key,value> {"key" : value}
        Map<Integer, OrderItemUpdateRequest> nonNullRequests = orderItemUpdateRequests.stream()
                .filter(orderItemUpdateRequest -> orderItemUpdateRequest.id() != null)
                .collect(Collectors.toMap(OrderItemUpdateRequest::id, orderItemUpdateRequest -> orderItemUpdateRequest));

        orderEntity.getOrderItemEntityList().removeIf(
                orderItemEntity -> !nonNullRequests.containsKey(orderItemEntity.getId()));

        Map<Integer, OrderItemEntity> existingItems = orderEntity.getOrderItemEntityList()
                .stream()
                .collect(Collectors.toMap(OrderItemEntity::getId, orderItemEntity -> orderItemEntity));


        List<Integer> menuIds = orderItemUpdateRequests.stream().map(OrderItemUpdateRequest::menuId).toList();

        List<MenuEntity> unavailableMenuList = menuRepo.findAllByIdInAndIsDeletedTrue(menuIds);

        if (!unavailableMenuList.isEmpty()){
            String unavailableMenuIdList = unavailableMenuList.stream().map(MenuEntity::getName).toList().toString();
            throw new OrderFailureException("Menu with Ids %s".formatted(unavailableMenuIdList));
        }

        Map<Integer,MenuEntity> menuEntityMap = menuRepo.findAllByIdInAndIsDeletedFalse(menuIds)
                .stream()
                .collect(Collectors.toMap(MenuEntity::getId,menuEntity ->  menuEntity));


        AtomicInteger orderTotalPrice = new AtomicInteger();

        for (OrderItemUpdateRequest orderItemUpdateRequest : orderItemUpdateRequests) {

            MenuEntity menuEntity = menuEntityMap.get(orderItemUpdateRequest.menuId());

            int unitPrice = menuEntity.getPrice();
            int quantity = orderItemUpdateRequest.quantity();
            int totalPrice = unitPrice * quantity;
            orderTotalPrice.addAndGet(totalPrice);

            if (existingItems.containsKey(orderItemUpdateRequest.id())) {
                //update the existing item in list this will direct update the hibernate object
                OrderItemEntity orderItemEntity = existingItems.get(orderItemUpdateRequest.id());
                orderItemEntity.setQuantity(quantity);
                orderItemEntity.setUnitPrice(unitPrice);
                orderItemEntity.setMenuEntity(menuEntity);

            } else {
                OrderItemEntity orderItemEntity = new OrderItemEntity();
                orderItemEntity.setMenuEntity(menuEntity);
                orderItemEntity.setOrderEntity(orderEntity);
                orderItemEntity.setQuantity(quantity);
                orderItemEntity.setUnitPrice(unitPrice);
                orderEntity.getOrderItemEntityList().add(orderItemEntity);

            }
        }
        orderEntity.setTotalPrice(orderTotalPrice.get());
        OrderEntity savedOrder = orderRepo.save(orderEntity);

        return orderMapper.toResponseDTO(savedOrder,"order updated successfully");
    }

    @Transactional
    public OrderResponse updateOrderStatus(Integer orderId, OrderStatusRequest orderStatusRequest, Long userId, String userRole){

        //state level permissions (Map<role,status they can update to>)
        //deleted cashier role because we no longer support update permission to it.
        Map<String, Set<String>> authorities = Map.of(
                "ROLE_CHEF", Set.of(OrderStatus.WAITING.getValue(),OrderStatus.COMPLETED.getValue()),
                "ROLE_ADMIN", Set.of(OrderStatus.COMPLETED.getValue(),OrderStatus.CANCELLED.getValue())
        );
        //state rules
        //waiting --> complete (chef) or cancel (admin)
        Map<String,Set<String>> statusRules = Map.of(
                OrderStatus.WAITING.getValue(),Set.of(OrderStatus.COMPLETED.getValue(),OrderStatus.CANCELLED.getValue()));

        //get by userRole
        Set<String> grantedAuthorities = authorities.get(userRole) != null ? authorities.get(userRole) : new HashSet<>();
        //check the typo
        String nextStatus = orderStatusRequest.status().trim().toLowerCase();
        //check if the user has right to change status
        if (grantedAuthorities.isEmpty() || !grantedAuthorities.contains(nextStatus))
            throw new InValidOrderStatusException("Invalid or Unauthorized status cannot be updated for " + userRole);

        OrderEntity targetOrderEntity = orderRepo.findById(orderId)
                    .orElseThrow(() -> new OrderFailureException("Order with Id " + orderId + " doesn't exist"));

        String currentStatus = targetOrderEntity.getStatus();
        //check if the incoming status is the same
        if (nextStatus.equals(currentStatus))
            throw new AlreadyUpdatedException("Already updated");

        targetOrderEntity.setStatus(nextStatus);
        OrderEntity savedOrder = orderRepo.save(targetOrderEntity);

        return orderMapper.toResponseDTO(savedOrder,"order status updated successfully");
    }

    private int generateOrderNumber(){
        LocalDate today = LocalDate.now();
        LocalDateTime startTime = today.atStartOfDay();
        LocalDateTime endTime = today.plusDays(1).atStartOfDay();
        Optional<OrderEntity> todayLatestOrder = orderRepo.findTopByCreatedAtBetweenOrderByOrderNumberDesc(startTime,endTime);

        return todayLatestOrder.map(orderEntity -> orderEntity.getOrderNumber() + 1).orElse(1);
    }

    private String calculateWorkloadTier(List<OrderItemEntity> orderItemEntityList){
        //0 - 4 (light), 5 - 9 (medium), 10+ (heavy)
        // Tier 1  = 1 point , Tier 2 medium = 5 points ,Tier 3 heavy = 10 points
        // quantity by tier * points
        //Map<tier,point>
        Map<Integer,Integer> pointsMap = Map.of(
                1,1,
                2,4,
                3,10
        );
        //Map<Integer,String> tiers = Map.of(1,"light",2,"medium",3,"heavy");
        int totalPoints = 0;

        for (OrderItemEntity orderItem : orderItemEntityList){

            int workloadTier = orderItem.getMenuEntity().getWorkloadTier();
            int orderItemQuantity = orderItem.getQuantity();

            if (pointsMap.get(workloadTier) == null){
                continue;
            }
            totalPoints += pointsMap.get(workloadTier) * orderItemQuantity;

        }

        if (totalPoints <= pointsMap.get(2))
            return OrderWorkloadTier.LIGHT.getValue();
        else if (totalPoints < pointsMap.get(3))
            return OrderWorkloadTier.MEDIUM.getValue();

        return OrderWorkloadTier.HEAVY.getValue();
    }

}
