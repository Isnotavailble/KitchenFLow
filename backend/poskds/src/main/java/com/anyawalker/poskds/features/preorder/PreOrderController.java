package com.anyawalker.poskds.features.preorder;

import com.anyawalker.poskds.features.preorder.dtos.PreOrderDto.CreateRequest;
import com.anyawalker.poskds.features.preorder.dtos.PreOrderDto.CreateResponse;
import com.anyawalker.poskds.features.preorder.dtos.PreOrderDto.DetailsResponse;
import com.anyawalker.poskds.features.preorder.exceptions.PreOrderNotFoundException;
import com.anyawalker.poskds.features.preorder.utils.PreOrderValidator;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("api/pre-orders")
public class PreOrderController {

    private final PreOrderService preOrderService;

    public PreOrderController(PreOrderService preOrderService) {
        this.preOrderService = preOrderService;
    }

    @PostMapping
    public ResponseEntity<?> createPreOrder(@RequestBody CreateRequest request) {
        String validationError = PreOrderValidator.validateCreatePayload(request);
        if (validationError != null) {
            return ResponseEntity.badRequest().body(Map.of("error", validationError));
        }

        CreateResponse response = preOrderService.createPreOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{code}")
    @PreAuthorize("hasAnyAuthority('ROLE_CASHIER', 'ROLE_ADMIN')")
    public ResponseEntity<?> getPreOrderByCode(@PathVariable String code) {
        String validationError = PreOrderValidator.validateCode(code);
        if (validationError != null) {
            return ResponseEntity.badRequest().body(Map.of("error", validationError));
        }

        try {
            DetailsResponse details = preOrderService.getPreOrderByCode(code);
            return ResponseEntity.ok(details);
        } catch (PreOrderNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{code}")
    @PreAuthorize("hasAnyAuthority('ROLE_CASHIER', 'ROLE_ADMIN')")
    public ResponseEntity<?> deletePreOrder(@PathVariable String code) {
        String validationError = PreOrderValidator.validateCode(code);
        if (validationError != null) {
            return ResponseEntity.badRequest().body(Map.of("error", validationError));
        }

        preOrderService.deletePreOrder(code);
        return ResponseEntity.ok(Map.of("message", "Pre-order draft deleted successfully"));
    }
}
