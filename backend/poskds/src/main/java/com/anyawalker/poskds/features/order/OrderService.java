package com.anyawalker.poskds.features.order;

import com.anyawalker.poskds.features.eventlistener.EventEmitterService;
import com.anyawalker.poskds.features.menu.MenuService;
import com.anyawalker.poskds.features.order.dtos.*;
import com.anyawalker.poskds.features.order.exceptions.AlreadyUpdatedException;
import com.anyawalker.poskds.features.order.exceptions.InValidOrderStatusException;
import com.anyawalker.poskds.features.order.exceptions.OrderFailureException;
import com.anyawalker.poskds.features.order.mappers.OrderItemMapper;
import com.anyawalker.poskds.models.dtos.OrderStatus;
import com.anyawalker.poskds.models.entities.MenuEntity;
import com.anyawalker.poskds.models.entities.OrderEntity;
import com.anyawalker.poskds.models.entities.OrderItemEntity;
import com.anyawalker.poskds.models.entities.UserEntity;
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
    private final MenuService menuService;
    private final OrderItemMapper orderItemMapper;
    private final EventEmitterService<OrderResponse> eventEmitterService;
    public OrderService(EventEmitterService<OrderResponse> eventEmitterService,
                        OrderRepo orderRepo,
                        UserRepo userRepo,
                        MenuService menuService,
                        OrderItemMapper orderItemMapper) {
        this.orderRepo = orderRepo;
        this.userRepo = userRepo;
        this.menuService = menuService;
        this.orderItemMapper = orderItemMapper;
        this.eventEmitterService = eventEmitterService;
    }

    public List<OrderResponse> viewAllOrders() {

        return orderRepo.findAll().stream().map(

                orderEntity -> new OrderResponse(
                        orderEntity.getId(),
                        orderEntity.getUserEntity().getId(),
                        orderEntity.getOrderNumber(),
                        orderEntity.getStatus(),
                        "",
                        orderEntity.getOrderItemEntityList().stream()
                                .map(orderItemMapper::toResponseDto)
                                .toList(),
                        orderEntity.getTotalPrice()
                )
        ).toList();
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest orderRequest, Long userId) {
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

        Map<Integer, MenuEntity> menuEntityMap = menuService.getMenuEntityMapByIds(menuEntityIds);

        //orderItemRequest -> orderItemEntity mapping process
        AtomicInteger totalOrderPrice = new AtomicInteger();
        List<OrderItemEntity> orderItemList = orderRequest.orderItems()
                .stream()
                .map(orderItemRequest -> {
                    MenuEntity menuEntity = menuEntityMap.get(orderItemRequest.menuId());

                    if (menuEntity == null)
                        throw new OrderFailureException("Could not create the order due to invalid menu_id with " +
                                orderItemRequest.menuId());

                    int totalPrice = orderItemRequest.quantity() * menuEntity.getPrice();
                    totalOrderPrice.addAndGet(totalPrice);

                    OrderItemEntity orderItem = new OrderItemEntity();
                    orderItem.setMenuEntity(menuEntity);
                    orderItem.setUnitPrice(menuEntity.getPrice());
                    orderItem.setQuantity(orderItemRequest.quantity());
                    orderItem.setOrderEntity(order);
                    return orderItem;
                })
                .toList();
        order.setOrderItemEntityList(orderItemList);
        order.setTotalPrice(totalOrderPrice.get());
        order.setOrderNumber(generateOrderNumber());
        OrderEntity savedOrder = orderRepo.save(order);

        //map orderItemEntity to orderItemResponse to get the db generated id
        List<OrderItemResponse> orderItemResponses = savedOrder.getOrderItemEntityList()
                .stream()
                .map(orderItemMapper::toResponseDto)
                .toList();
        return new OrderResponse(
                savedOrder.getId(),
                userId,
                savedOrder.getOrderNumber(),
                savedOrder.getStatus(),
                "order created successfully",
                orderItemResponses,savedOrder.getTotalPrice()
        );
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
        Map<Integer, MenuEntity> menuEntityMap = menuService.getMenuEntityMapByIds(menuIds);


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

        //map orderItemEntity to orderItemResponse to get the db generated id
        List<OrderItemResponse> orderItemResponses = savedOrder.getOrderItemEntityList()
                .stream()
                .map(orderItemMapper::toResponseDto)
                .toList();

        return new OrderResponse(
                savedOrder.getId(),
                userId,
                savedOrder.getOrderNumber(),
                savedOrder.getStatus(),
                "order updated successfully",
                orderItemResponses, savedOrder.getTotalPrice()
                );
    }

    @Transactional
    public OrderResponse updateOrderStatus(Integer orderId, OrderStatusRequest orderStatusRequest, Long userId, String userRole){
        //state level permissions
        Map<String, Set<String>> authorities = Map.of(
                "ROLE_CASHIER",Set.of(OrderStatus.CANCEL.getValue()),
                "ROLE_CHEF", Set.of(OrderStatus.WAITING.getValue(),OrderStatus.COMPLETE.getValue(),OrderStatus.COOKING.getValue()),
                "ROLE_ADMIN", Set.of(OrderStatus.COMPLETE.getValue(),OrderStatus.WAITING.getValue(),OrderStatus.COOKING.getValue(),OrderStatus.CANCEL.getValue())
        );
        //state rules
        //waiting --> cooking --> complete
        //waiting --> cancel
        Map<String,Set<String>> statusRules = Map.of(
                OrderStatus.WAITING.getValue(),Set.of(OrderStatus.COOKING.getValue(),OrderStatus.CANCEL.getValue()),
                OrderStatus.COOKING.getValue(), Set.of(OrderStatus.COMPLETE.getValue())
        );
        //get by userRole
        Set<String> grantedAuthorities = authorities.get(userRole);
        //check the typo
        String nextStatus = orderStatusRequest.status().trim().toLowerCase();
        //check if the user has pemission to change status
        if (grantedAuthorities == null || !grantedAuthorities.contains(nextStatus))
            throw new InValidOrderStatusException("Invalid or Unauthorized status cannot be updated for" + userRole);

        //chef or admin have to see all order coming from all cashier ( the current focus is one shop not multiple shop)
        OrderEntity targetOrderEntity;
        if (userRole.equals("ROLE_ADMIN") || userRole.equals("ROLE_CHEF"))
            targetOrderEntity = orderRepo.findById(orderId)
                    .orElseThrow(() -> new OrderFailureException("Order with Id " + orderId + " doesn't exist"));

        //cashier only need to see their own orders
        else
            targetOrderEntity = orderRepo.findByIdAndUserEntity_Id(orderId, userId)
                    .orElseThrow(() -> new OrderFailureException("Order with Id " + orderId + " doesn't exist"));

        String currentStatus = targetOrderEntity.getStatus();
        //check if the incoming status is the same
        if (nextStatus.equals(currentStatus))
            throw new AlreadyUpdatedException("Already updated");
        //check if the current status can be updatable
        else if (statusRules.get(currentStatus) == null)
            throw new InValidOrderStatusException("Cannot update %s to %s (OrderId:%d)"
                    .formatted(currentStatus,nextStatus,orderId));

        targetOrderEntity.setStatus(nextStatus);
        OrderEntity savedOrder = orderRepo.save(targetOrderEntity);

        //Mapping operation
        List<OrderItemResponse> orderItemResponses = savedOrder.getOrderItemEntityList()
                .stream()
                .map(orderItemMapper::toResponseDto)
                .toList();
        Long orderCreatorId = savedOrder.getUserEntity().getId();
        OrderResponse response = new OrderResponse(
                savedOrder.getId(),
                orderCreatorId,
                savedOrder.getOrderNumber(),
                savedOrder.getStatus(),
                "order status updated successfully",
                orderItemResponses,
                savedOrder.getTotalPrice()
        );

        eventEmitterService.publish(userRole,userRole + "-update-order",response);
        return  response;
    }

    private int generateOrderNumber(){
        LocalDate today = LocalDate.now();
        LocalDateTime startTime = today.atStartOfDay();
        LocalDateTime endTime = today.plusDays(1).atStartOfDay();
        Optional<OrderEntity> todayLatestOrder = orderRepo.findTopByCreatedAtBetweenOrderByOrderNumberDesc(startTime,endTime);

        return todayLatestOrder.map(orderEntity -> orderEntity.getOrderNumber() + 1).orElse(1);

    }

}
