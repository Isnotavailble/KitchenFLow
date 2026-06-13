package com.anyawalker.poskds.features.order;

import com.anyawalker.poskds.features.order.dtos.OrderItemRequest;
import com.anyawalker.poskds.features.order.dtos.OrderItemResponse;
import com.anyawalker.poskds.features.order.dtos.OrderRequest;
import com.anyawalker.poskds.features.order.dtos.OrderResponse;
import com.anyawalker.poskds.features.order.exceptions.OrderFailureException;
import com.anyawalker.poskds.models.entities.MenuEntity;
import com.anyawalker.poskds.models.entities.OrderEntity;
import com.anyawalker.poskds.models.entities.OrderItemEntity;
import com.anyawalker.poskds.models.entities.UserEntity;
import com.anyawalker.poskds.repos.MenuRepo;
import com.anyawalker.poskds.repos.OrderRepo;
import com.anyawalker.poskds.repos.UserRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class OrderService {
    private final OrderRepo orderRepo;
    private final UserRepo userRepo;
    private final MenuRepo menuRepo;
    public OrderService(OrderRepo orderRepo, UserRepo userRepo, MenuRepo menuRepo){
        this.orderRepo = orderRepo;
        this.userRepo = userRepo;
        this.menuRepo = menuRepo;
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest orderRequest){
        UserEntity orderCreator = userRepo.findById(orderRequest.userId())
                .orElseThrow( () ->  new OrderFailureException("Could not create the order due to invalid user id"));

        OrderEntity order = new OrderEntity();
        order.setUserEntity(orderCreator);
        order.setStatus("waiting");
        //extract all menu id
        List<Long> menuEntityIds = orderRequest.orderItems()
                .stream()
                .map(OrderItemRequest::menuId)
                .distinct()
                .toList();
        //get all menu by list of ids
        List<MenuEntity> menuEntityList = menuRepo.findAllById(menuEntityIds);

        //create Map for lookup ( faster than list )
        Map<Long,MenuEntity> menuEntityMap = menuEntityList.stream()
                .collect(Collectors.toMap(MenuEntity::getId,menuEntity -> menuEntity));

        //orderItemRequest -> orderItemEntity mapping process
        AtomicInteger totalOrderPrice = new AtomicInteger();
        List<OrderItemEntity> orderItemList = orderRequest.orderItems()
                .stream()
                .map(orderItemRequest -> {
                    MenuEntity menuEntity = menuEntityMap.get(orderItemRequest.menuId());

                    if (menuEntity == null)
                        throw new OrderFailureException("Could not create the order due to invalid menu_id with " +
                                orderItemRequest.menuId());

                    int totalPrice = orderItemRequest.quantity() * menuEntity.getCurrentPrice();
                    totalOrderPrice.addAndGet(totalPrice);

                    OrderItemEntity orderItem = new OrderItemEntity();
                    orderItem.setMenuEntity(menuEntity);
                    orderItem.setTotalPrice(totalPrice);
                    orderItem.setUnitPrice(menuEntity.getCurrentPrice());
                    orderItem.setQuantity(orderItemRequest.quantity());
                    orderItem.setOrderEntity(order);
                    return orderItem;
                })
                .toList();
        order.setOrderItemEntityList(orderItemList);
        order.setTotalPrice(totalOrderPrice.get());
        OrderEntity savedOrder = orderRepo.save(order);

        //map orderItemEntity to orderItemResponse to get the db generated id
        List<OrderItemResponse> orderItemResponses = savedOrder.getOrderItemEntityList()
                .stream()
                .map(
                        orderItemEntity -> new OrderItemResponse(
                                orderItemEntity.getId(),
                                orderItemEntity.getMenuEntity().getId(),
                                orderItemEntity.getQuantity(),
                                orderItemEntity.getUnitPrice(),
                                orderItemEntity.getTotalPrice()
                        )
                ).toList();

        return new OrderResponse(
                savedOrder.getId(),
                orderRequest.userId(),
                savedOrder.getStatus(),
                "order created successfully",
                orderItemResponses);

    }

}
