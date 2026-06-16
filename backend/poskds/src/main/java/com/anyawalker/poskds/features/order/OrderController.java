package com.anyawalker.poskds.features.order;

import com.anyawalker.poskds.features.order.dtos.OrderItemUpdateRequest;
import com.anyawalker.poskds.features.order.dtos.OrderRequest;
import com.anyawalker.poskds.features.order.dtos.OrderStatusRequest;
import com.anyawalker.poskds.features.order.exceptions.AlreadyUpdatedException;
import com.anyawalker.poskds.features.order.exceptions.InValidOrderStatusException;
import com.anyawalker.poskds.features.order.exceptions.OrderFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/orders")
public class OrderController {
    private final OrderService orderService;
    public OrderController(OrderService orderService){
        this.orderService = orderService;
    }

    @GetMapping("/view_orders")
    public ResponseEntity<?> viewAllOrders(){
        return ResponseEntity.ok(orderService.viewAllOrders());
    }

    @PostMapping("/create_order")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_CASHIER')")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest,@AuthenticationPrincipal Jwt jwt){
        try{
            Long userId = jwt.getClaim("userId");

            return ResponseEntity.ok(orderService.createOrder(orderRequest,userId));

        } catch (OrderFailureException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("status",e.getMessage()));
        }
    }
    @PatchMapping("/update_order_items/{orderId}")
    @PreAuthorize("hasAnyAuthority('ROLE_CASHIER','ROLE_ADMIN')")
    public ResponseEntity<?> updateOrderItem(@PathVariable Long orderId,
                                             @RequestBody Map<String, List<OrderItemUpdateRequest>> orderRequest,
                                             @AuthenticationPrincipal Jwt jwt){
        try {
            Long userId = jwt.getClaim("userId");
            return ResponseEntity.ok(orderService.updateOrderItems(orderId,orderRequest.get("orderItems"),userId));
        }
        catch (OrderFailureException e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("status",e.getMessage()));
        }
    }
    @PatchMapping("/update_order_status/{orderId}")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId, @RequestBody OrderStatusRequest orderStatusRequest,
                                               @AuthenticationPrincipal Jwt jwt){
        try {
            Long userId = jwt.getClaim("userId");
            String userRole = "ROLE_" + jwt.getClaim("role");
            return ResponseEntity.ok(orderService.updateOrderStatus(orderId,orderStatusRequest,userId,userRole));
        }
        catch (InValidOrderStatusException | OrderFailureException e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("status",e.getMessage()));
        }
        catch (AlreadyUpdatedException e){
            return ResponseEntity.ok(Map.of("status", e.getMessage()));
        }

    }

}
