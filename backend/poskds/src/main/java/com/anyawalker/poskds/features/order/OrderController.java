package com.anyawalker.poskds.features.order;

import com.anyawalker.poskds.features.eventlistener.EventEmitterService;
import com.anyawalker.poskds.features.order.dtos.*;
import com.anyawalker.poskds.features.order.exceptions.AlreadyUpdatedException;
import com.anyawalker.poskds.features.order.exceptions.InValidOrderStatusException;
import com.anyawalker.poskds.features.order.exceptions.OrderFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/orders")
public class OrderController {
    private final OrderService orderService;
    private final EventEmitterService<OrderResponse> eventEmitterService;
    public OrderController(OrderService orderService, EventEmitterService<OrderResponse> eventEmitterService){
        this.orderService = orderService;
        this.eventEmitterService = eventEmitterService;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_CHEF','ROLE_ADMIN')")
    public ResponseEntity<PaginatedOrderResponse> getOrders(
            @RequestParam(required = false, defaultValue = "All") String status,
            @RequestParam(required = false) Integer orderNumber,
            @RequestParam(required = false) String category,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(orderService.getOrders(status, orderNumber, category, page, size));
    }

    @GetMapping("/completed_pickups")
    @PreAuthorize("hasAnyAuthority('ROLE_CASHIER','ROLE_ADMIN','ROLE_CHEF')")
    public ResponseEntity<List<OrderResponse>> getCompletedPickups() {
        return ResponseEntity.ok(orderService.getCompletedPickupsToday());
    }

    @GetMapping("/view_orders")
    public ResponseEntity<?> viewAllOrders(){
        return ResponseEntity.ok(orderService.viewAllOrders());
    }

    // frontend ---> backend
    //cashier --> backend ---> chef
    @PostMapping("/create_order")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_CASHIER')")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest,@AuthenticationPrincipal Jwt jwt){
        try{
            Long userId = jwt.getClaim("userId");
            String userRole = "ROLE_" + jwt.getClaim("role");
            OrderResponse orderResponse = orderService.createOrder(orderRequest,userId);
            eventEmitterService.publish(userRole,"order-created",orderResponse);
            return ResponseEntity.ok(orderResponse);

        } catch (OrderFailureException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/update_order_status/{orderId}")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Integer orderId, @RequestBody OrderStatusRequest orderStatusRequest,
                                               @AuthenticationPrincipal Jwt jwt){
        try {
            Long userId = jwt.getClaim("userId");
            String userRole = "ROLE_" + jwt.getClaim("role");
            OrderResponse orderResponse = orderService.updateOrderStatus(orderId,orderStatusRequest,userId,userRole);
            eventEmitterService.publish(userRole,"order-updated",orderResponse);
            return ResponseEntity.ok(orderResponse);
        }
        catch (InValidOrderStatusException | OrderFailureException e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
        catch (AlreadyUpdatedException e){
            return ResponseEntity.ok(Map.of("error", e.getMessage()));
        }

    }
    //updated : let the system create route for connections
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter getEvent(@AuthenticationPrincipal Jwt jwt){
        String role = "ROLE_" + jwt.getClaim("role");

        List<String> roles = new ArrayList<>(List.of("ROLE_ADMIN","ROLE_CASHIER","ROLE_CHEF"));
        roles.remove(role);
        SseEmitter sseEmitter = new SseEmitter(Duration.ofHours(1).toMillis());

        //listen all channel except their own.
        //warning : the client may receive the O(N) message.
        roles.forEach(r -> eventEmitterService.subscribe(r,sseEmitter));

        try {
            sseEmitter.send(SseEmitter.event().name("INIT").data("connected"));
        } catch (IOException e) {
            // handshake error
        }

        return sseEmitter;
    }
}
