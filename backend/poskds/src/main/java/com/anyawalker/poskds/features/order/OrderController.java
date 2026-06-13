package com.anyawalker.poskds.features.order;

import com.anyawalker.poskds.features.order.dtos.OrderRequest;
import com.anyawalker.poskds.features.order.exceptions.OrderFailureException;
import com.anyawalker.poskds.models.entities.MenuEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("api/cashier")
public class OrderController {
    private final OrderService orderService;
    private final MenuService menuService;
    public OrderController(OrderService orderService, MenuService menuService){
        this.orderService = orderService;
        this.menuService = menuService;
    }
    @GetMapping("/view_orders")
    public ResponseEntity<?> viewAllOrders(@AuthenticationPrincipal Jwt jwt){
        Long userId = jwt.getClaim("userId");
        String email = jwt.getSubject();
        return ResponseEntity.ok(Map.of(
                "userId",userId,
                "subject",email,
                "status","this user can see the all orders!"
        ));
    }
    @PostMapping("/create_order")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest){
        try{
            return ResponseEntity.ok(orderService.createOrder(orderRequest));

        } catch (OrderFailureException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("status",e.getMessage()));
        }
    }

    @GetMapping("/view_menus")
    public ResponseEntity<?> viewAllMenu(){
        return ResponseEntity.ok(menuService.getAllMenu());
    }
}
