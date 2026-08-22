package com.anyawalker.poskds.features.sales;

import com.anyawalker.poskds.features.sales.dtos.CashierBalanceDto;
import com.anyawalker.poskds.features.sales.dtos.MenuPerformanceDto;
import com.anyawalker.poskds.features.sales.dtos.SalesSummaryDto;
import com.anyawalker.poskds.features.sales.dtos.SalesTrendPointDto;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/sales")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSalesController {

    private final SalesAnalyticsService salesAnalyticsService;

    public AdminSalesController(SalesAnalyticsService salesAnalyticsService) {
        this.salesAnalyticsService = salesAnalyticsService;
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getDashboardSummary() {
        return ResponseEntity.ok(salesAnalyticsService.getDashboardSummary());
    }

    @GetMapping("/trends")
    public ResponseEntity<?> getSalesTrends(
            @RequestParam(name = "period", defaultValue = "DAILY") String period,
            @RequestParam(name = "interval", defaultValue = "60") int intervalMinutes,
            @RequestParam(name = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(salesAnalyticsService.getSalesTrends(period, intervalMinutes, date));
    }


    @GetMapping("/menu-performance")
    public ResponseEntity<?> getMenuPerformance(
            @RequestParam(name = "period", defaultValue = "DAILY") String period,
            @RequestParam(name = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(salesAnalyticsService.getMenuPerformance(period, date));
    }

    @GetMapping("/cashier-balances")
    public ResponseEntity<?> getCashierBalances(
            @RequestParam(name = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(salesAnalyticsService.getCashierBalances(date));
    }
}


