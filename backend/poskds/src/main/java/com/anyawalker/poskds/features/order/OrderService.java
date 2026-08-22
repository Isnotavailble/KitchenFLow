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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class OrderService {
    private final Set<String> ORDERTYPE = Set.of("takeaway","dine_in");
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

    public PaginatedOrderResponse getOrders(String status, Integer orderNumber, String category, int page, int size) {
        LocalDate today = LocalDate.now();
        LocalDateTime startTime = today.atStartOfDay();
        LocalDateTime endTime = today.plusDays(1).atStartOfDay();

        String dbStatus;
        LocalDateTime priorityCutoff = null;

        if (status == null || status.isBlank() || status.equalsIgnoreCase("All") || status.equalsIgnoreCase("Active")) {
            dbStatus = OrderStatus.WAITING.getValue();
        } else if (status.equalsIgnoreCase("Waiting")) {
            dbStatus = OrderStatus.WAITING.getValue();
        } else if (status.equalsIgnoreCase("Priority")) {
            dbStatus = OrderStatus.WAITING.getValue();
            priorityCutoff = LocalDateTime.now().minusMinutes(10);
        } else if (status.equalsIgnoreCase("Complete") || status.equalsIgnoreCase("Completed")) {
            dbStatus = OrderStatus.COMPLETED.getValue();
        } else if (status.equalsIgnoreCase("Cancelled") || status.equalsIgnoreCase("Canceled")) {
            dbStatus = OrderStatus.CANCELLED.getValue();
        } else {
            dbStatus = status.trim().toLowerCase();
        }

        String filterCategory = (category != null && !category.isBlank() && !category.equalsIgnoreCase("ALL"))
                ? category.trim()
                : null;

        Sort sort;
        if (status != null && (status.equalsIgnoreCase("Complete") || status.equalsIgnoreCase("Completed") || status.equalsIgnoreCase("Cancelled") || status.equalsIgnoreCase("Canceled"))) {
            sort = Sort.by(Sort.Direction.DESC, "updatedAt").and(Sort.by(Sort.Direction.DESC, "createdAt"));
        } else {
            sort = Sort.by(Sort.Direction.ASC, "createdAt");
        }


        int pageSize = size > 0 ? size : 20;
        int pageIndex = Math.max(0, page);
        Pageable pageable = PageRequest.of(pageIndex, pageSize, sort);

        String catLower = filterCategory != null ? filterCategory.toLowerCase() : null;

        Page<OrderEntity> orderPage = orderRepo.findOrdersByFilters(
                startTime,
                endTime,
                dbStatus,
                priorityCutoff,
                orderNumber,
                catLower,
                pageable
        );

        List<OrderResponse> items = orderPage.getContent()
                .stream()
                .map(order -> orderMapper.toResponseDTO(order, ""))
                .toList();

        return new PaginatedOrderResponse(
                items,
                orderPage.getNumber(),
                orderPage.getSize(),
                orderPage.getTotalElements(),
                orderPage.getTotalPages(),
                orderPage.hasNext()
        );
    }

    public List<OrderResponse> getCompletedPickupsToday() {
        LocalDate today = LocalDate.now();
        LocalDateTime startTime = today.atStartOfDay();
        LocalDateTime endTime = today.plusDays(1).atStartOfDay();

        List<OrderEntity> completedOrders = orderRepo.findTodayCompletedOrders(startTime, endTime);
        return completedOrders.stream()
                .map(order -> orderMapper.toResponseDTO(order, ""))
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

        if (orderRequest.orderType() == null || orderRequest.orderType().isBlank())
            throw new OrderFailureException("Order type must be defined");

        if (!ORDERTYPE.contains(orderRequest.orderType()))
            throw new OrderFailureException("Order type %s is not a valid order type".formatted(orderRequest.orderType()));


        UserEntity orderCreator = userRepo.findById(userId)
                .orElseThrow(() -> new OrderFailureException("Could not create the order due to invalid user id"));


        OrderEntity order = new OrderEntity();
        order.setUserEntity(orderCreator);
        order.setStatus(OrderStatus.WAITING.getValue());
        //extract all menu id
        List<Integer> menuEntityIds = nonNullOrderItemList.stream()
                .map(OrderItemRequest::menuId)
                .distinct()
                .toList();

        Map<Integer, MenuEntity> menuEntityMap = validateAndFetchAvailableMenus(menuEntityIds);

        //orderItemRequest -> orderItemEntity mapping process
        AtomicInteger totalPriceBeforeTax = new AtomicInteger();
        double taxRate = 0.05;

        List<OrderItemEntity> orderItemList = nonNullOrderItemList
                .stream()
                .map(orderItemRequest -> {
                    MenuEntity menuEntity = menuEntityMap.get(orderItemRequest.menuId());
                    int itemTotalPrice = orderItemRequest.quantity() * menuEntity.getPrice();
                    totalPriceBeforeTax.addAndGet(itemTotalPrice);

                    OrderItemEntity orderItem = new OrderItemEntity();
                    orderItem.setMenuEntity(menuEntity);
                    orderItem.setUnitPrice(menuEntity.getPrice());
                    orderItem.setQuantity(orderItemRequest.quantity());
                    orderItem.setOrderEntity(order);
                    orderItem.setItemNotes(orderItemRequest.itemNote());
                    return orderItem;

                })
                .toList();

        int subtotal = totalPriceBeforeTax.get();
        int taxAmount = (int) Math.round(subtotal * taxRate);
        int totalPriceAfterTax = subtotal + taxAmount;

        String orderWorkloadTier = calculateWorkloadTier(orderItemList);
        order.setOrderItemEntityList(orderItemList);
        order.setSubtotalPrice(subtotal);
        order.setTaxAmount(taxAmount);
        order.setTotalPrice(totalPriceAfterTax);
        order.setOrderNumber(generateOrderNumber());
        order.setOrderWorkloadTier(orderWorkloadTier);
        order.setOrderType(orderRequest.orderType());
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

        Map<Integer, OrderItemUpdateRequest> nonNullRequests = orderItemUpdateRequests.stream()
                .filter(orderItemUpdateRequest -> orderItemUpdateRequest.id() != null)
                .collect(Collectors.toMap(OrderItemUpdateRequest::id, orderItemUpdateRequest -> orderItemUpdateRequest));

        orderEntity.getOrderItemEntityList().removeIf(
                orderItemEntity -> !nonNullRequests.containsKey(orderItemEntity.getId()));

        Map<Integer, OrderItemEntity> existingItems = orderEntity.getOrderItemEntityList()
                .stream()
                .collect(Collectors.toMap(OrderItemEntity::getId, orderItemEntity -> orderItemEntity));

        List<Integer> menuIds = orderItemUpdateRequests.stream()
                .map(OrderItemUpdateRequest::menuId)
                .distinct()
                .toList();

        Map<Integer, MenuEntity> menuEntityMap = validateAndFetchAvailableMenus(menuIds);

        AtomicInteger orderTotalPrice = new AtomicInteger();

        for (OrderItemUpdateRequest orderItemUpdateRequest : orderItemUpdateRequests) {
            MenuEntity menuEntity = menuEntityMap.get(orderItemUpdateRequest.menuId());

            int unitPrice = menuEntity.getPrice();
            int quantity = orderItemUpdateRequest.quantity();
            int totalPrice = unitPrice * quantity;
            orderTotalPrice.addAndGet(totalPrice);

            if (existingItems.containsKey(orderItemUpdateRequest.id())) {
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

        int subtotal = orderTotalPrice.get();
        int taxAmount = (int) Math.round(subtotal * 0.05);
        int totalPrice = subtotal + taxAmount;

        orderEntity.setSubtotalPrice(subtotal);
        orderEntity.setTaxAmount(taxAmount);
        orderEntity.setTotalPrice(totalPrice);
        orderEntity.setOrderWorkloadTier(calculateWorkloadTier(orderEntity.getOrderItemEntityList()));
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
        List<OrderItemEntity> orderItemEntityList = targetOrderEntity.getOrderItemEntityList();

        if (nextStatus.equals(OrderStatus.COMPLETED.getValue())) {
            //get the unavailable order item if the list is not null which mean we got it!
            List<Integer> menuIds = orderItemEntityList.stream()
                    .filter(orderItemEntity -> !orderItemEntity.getMenuEntity().isAvailable())
                    .map(orderItemEntity -> orderItemEntity.getMenuEntity().getId()).toList();

            if (!menuIds.isEmpty()){
                List<String> menuNames = menuRepo.findMenuNamesByIds(menuIds);
                String cleanName = menuNames.isEmpty() ? "unknown items" : menuNames.toString()
                        .replace("[","").replace("]","").trim();

                throw new OrderFailureException("Order Items " +  cleanName + " are unavailable.");
            }
        }


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

    private Map<Integer, MenuEntity> validateAndFetchAvailableMenus(List<Integer> menuIds) {
        List<MenuEntity> menuList = menuRepo.findAllById(menuIds);
        Map<Integer, MenuEntity> menuEntityMap = menuList.stream()
                .collect(Collectors.toMap(MenuEntity::getId, m -> m));

        for (Integer id : menuIds) {
            MenuEntity menu = menuEntityMap.get(id);
            if (menu == null || menu.isDeleted()) {
                throw new OrderFailureException("Menu item with ID " + id + " does not exist");
            }
        }

        List<String> unavailableMenuNames = menuList.stream()
                .filter(m -> !m.isAvailable())
                .map(MenuEntity::getName)
                .toList();

        if (!unavailableMenuNames.isEmpty()) {
            if (unavailableMenuNames.size() == 1) {
                throw new OrderFailureException(unavailableMenuNames.getFirst() + " is not available");
            } else {
                throw new OrderFailureException(String.join(", ", unavailableMenuNames) + " are not available");
            }
        }

        return menuEntityMap;
    }

}
