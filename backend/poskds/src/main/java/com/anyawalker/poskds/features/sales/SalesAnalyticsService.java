package com.anyawalker.poskds.features.sales;

import com.anyawalker.poskds.features.sales.dtos.CashierBalanceDto;
import com.anyawalker.poskds.features.sales.dtos.MenuPerformanceDto;
import com.anyawalker.poskds.features.sales.dtos.SalesSummaryDto;
import com.anyawalker.poskds.features.sales.dtos.SalesTrendPointDto;
import com.anyawalker.poskds.models.MenuEntity;
import com.anyawalker.poskds.models.OrderEntity;
import com.anyawalker.poskds.models.UserEntity;
import com.anyawalker.poskds.repos.MenuRepo;
import com.anyawalker.poskds.repos.OrderItemRepo;
import com.anyawalker.poskds.repos.OrderRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
public class SalesAnalyticsService {

    private final OrderRepo orderRepo;
    private final OrderItemRepo orderItemRepo;
    private final MenuRepo menuRepo;

    public SalesAnalyticsService(OrderRepo orderRepo, OrderItemRepo orderItemRepo, MenuRepo menuRepo) {
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
        this.menuRepo = menuRepo;
    }


    @Transactional(readOnly = true)
    public SalesSummaryDto getDashboardSummary() {
        LocalDate today = LocalDate.now();
        LocalDateTime startTime = today.atStartOfDay();
        LocalDateTime endTime = startTime.plusDays(1);

        List<OrderEntity> completedOrders = orderRepo.findCompletedOrdersForSales(startTime, endTime);
        int activeWaitingCount = (int) orderRepo.countByStatus("waiting");

        long totalRevenue = 0;
        long grossRevenue = 0;
        long taxAmount = 0;
        long discountAmount = 0;
        long cashRevenue = 0;
        long onlineRevenue = 0;
        int cashCount = 0;
        int onlineCount = 0;

        for (OrderEntity order : completedOrders) {
            long price = order.getTotalPrice();
            totalRevenue += price;
            grossRevenue += (order.getSubtotalPrice() != null ? order.getSubtotalPrice() : price);
            taxAmount += (order.getTaxAmount() != null ? order.getTaxAmount() : 0);
            discountAmount += (order.getDiscountAmount() != null ? order.getDiscountAmount() : 0);

            String method = order.getPaymentMethod() != null ? order.getPaymentMethod().toLowerCase() : "cash";
            if ("online".equals(method)) {
                onlineRevenue += price;
                onlineCount++;
            } else {
                cashRevenue += price;
                cashCount++;
            }
        }

        long netRevenue = Math.max(0, totalRevenue - taxAmount);

        // Fetch top best-seller for today
        List<Object[]> topItems = orderItemRepo.findMenuPerformance(startTime, endTime);
        SalesSummaryDto.BestSellingItemDto bestSeller = null;
        if (!topItems.isEmpty()) {
            Object[] row = topItems.get(0);
            Integer menuId = (Integer) row[0];
            String name = (String) row[1];
            long qty = ((Number) row[4]).longValue();
            long revenue = ((Number) row[5]).longValue();
            bestSeller = new SalesSummaryDto.BestSellingItemDto(menuId, name, qty, revenue);
        }

        SalesSummaryDto.PaymentSplitDto split = new SalesSummaryDto.PaymentSplitDto(
            cashRevenue,
            onlineRevenue,
            cashCount,
            onlineCount
        );

        // Minute-level Peak Operation Time calculation (96 slots of 15 minutes)
        int[] intervalOrders = new int[96];
        for (OrderEntity order : completedOrders) {
            if (order.getCreatedAt() != null) {
                int hour = order.getCreatedAt().getHour();
                int minute = order.getCreatedAt().getMinute();
                int slot = hour * 4 + (minute / 15);
                if (slot >= 0 && slot < 96) {
                    intervalOrders[slot]++;
                }
            }
        }

        int peakSlot = 0;
        int maxSlotOrders = -1;
        int lowestSlot = 0;
        int minSlotOrders = Integer.MAX_VALUE;

        for (int i = 0; i < 96; i++) {
            if (intervalOrders[i] > maxSlotOrders) {
                maxSlotOrders = intervalOrders[i];
                peakSlot = i;
            }
            if (intervalOrders[i] < minSlotOrders) {
                minSlotOrders = intervalOrders[i];
                lowestSlot = i;
            }
        }

        SalesSummaryDto.PeakOperationTimeDto peakTimeDto = new SalesSummaryDto.PeakOperationTimeDto(
            formatSlotTo12Hour(peakSlot),
            Math.max(0, maxSlotOrders),
            formatSlotTo12Hour(lowestSlot),
            minSlotOrders == Integer.MAX_VALUE ? 0 : minSlotOrders
        );

        return new SalesSummaryDto(
            totalRevenue,
            grossRevenue,
            netRevenue,
            taxAmount,
            discountAmount,
            completedOrders.size(),
            activeWaitingCount,
            bestSeller,
            split,
            peakTimeDto
        );
    }

    private String formatSlotTo12Hour(int slot) {
        int hour = slot / 4;
        int minute = (slot % 4) * 15;
        int hour12 = (hour % 12 == 0) ? 12 : (hour % 12);
        String ampm = (hour < 12) ? "AM" : "PM";
        return String.format("%d:%02d %s", hour12, minute, ampm);
    }


    @Transactional(readOnly = true)
    public List<SalesTrendPointDto> getSalesTrends(String period, int intervalMinutes, LocalDate targetDate) {
        LocalDate date = targetDate != null ? targetDate : LocalDate.now();
        String periodType = period != null ? period.toUpperCase() : "DAILY";

        return switch (periodType) {
            case "WEEKLY" -> getWeeklyTrends(date);
            case "MONTHLY" -> getMonthlyTrends(date);
            case "DAILY" -> getDailyTrends(date, intervalMinutes);
            default -> getDailyTrends(date, intervalMinutes);
        };
    }

    private List<SalesTrendPointDto> getDailyTrends(LocalDate date, int intervalMinutes) {
        int interval = (intervalMinutes == 15 || intervalMinutes == 30 || intervalMinutes == 60) ? intervalMinutes : 60;
        int totalSlots = 1440 / interval;

        LocalDateTime startTime = date.atStartOfDay();
        LocalDateTime endTime = startTime.plusDays(1);
        List<OrderEntity> orders = orderRepo.findCompletedOrdersForSales(startTime, endTime);

        long[] slotRevenue = new long[totalSlots];
        int[] slotOrders = new int[totalSlots];

        for (OrderEntity order : orders) {
            if (order.getCreatedAt() != null) {
                int minuteOfDay = order.getCreatedAt().getHour() * 60 + order.getCreatedAt().getMinute();
                int slot = Math.min(totalSlots - 1, Math.max(0, minuteOfDay / interval));
                slotRevenue[slot] += order.getTotalPrice();
                slotOrders[slot]++;
            }
        }

        List<SalesTrendPointDto> result = new ArrayList<>();
        for (int s = 0; s < totalSlots; s++) {
            int slotMinute = s * interval;
            int hour = slotMinute / 60;
            int min = slotMinute % 60;
            int hour12 = (hour % 12 == 0) ? 12 : (hour % 12);
            String ampm = (hour < 12) ? "AM" : "PM";
            String label = (interval == 60)
                ? String.format("%d %s", hour12, ampm)
                : String.format("%d:%02d %s", hour12, min, ampm);
            String key = String.format("%d:%02d %s", hour12, min, ampm);
            result.add(new SalesTrendPointDto(label, key, slotRevenue[s], slotOrders[s]));
        }
        return result;
    }



    private List<SalesTrendPointDto> getWeeklyTrends(LocalDate date) {
        LocalDate monday = date.with(DayOfWeek.MONDAY);
        LocalDateTime startTime = monday.atStartOfDay();
        LocalDateTime endTime = startTime.plusDays(7);
        List<OrderEntity> orders = orderRepo.findCompletedOrdersForSales(startTime, endTime);

        String[] dayNames = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        long[] dailyRevenue = new long[7];
        int[] dailyOrders = new int[7];

        for (OrderEntity order : orders) {
            if (order.getCreatedAt() != null) {
                int dayIndex = order.getCreatedAt().getDayOfWeek().getValue() - 1; // 1 (Mon) -> 0
                if (dayIndex >= 0 && dayIndex < 7) {
                    dailyRevenue[dayIndex] += order.getTotalPrice();
                    dailyOrders[dayIndex]++;
                }
            }
        }

        List<SalesTrendPointDto> result = new ArrayList<>();
        for (int d = 0; d < 7; d++) {
            LocalDate currentDay = monday.plusDays(d);
            String fullLabel = dayNames[d] + " (" + currentDay.format(DateTimeFormatter.ofPattern("MM/dd")) + ")";
            result.add(new SalesTrendPointDto(dayNames[d], fullLabel, dailyRevenue[d], dailyOrders[d]));
        }
        return result;
    }

    private List<SalesTrendPointDto> getMonthlyTrends(LocalDate date) {
        LocalDate firstDay = date.withDayOfMonth(1);
        int daysInMonth = date.lengthOfMonth();
        LocalDateTime startTime = firstDay.atStartOfDay();
        LocalDateTime endTime = startTime.plusMonths(1);
        List<OrderEntity> orders = orderRepo.findCompletedOrdersForSales(startTime, endTime);

        long[] dayRevenue = new long[daysInMonth + 1];
        int[] dayOrders = new int[daysInMonth + 1];

        for (OrderEntity order : orders) {
            if (order.getCreatedAt() != null) {
                int day = order.getCreatedAt().getDayOfMonth();
                if (day >= 1 && day <= daysInMonth) {
                    dayRevenue[day] += order.getTotalPrice();
                    dayOrders[day]++;
                }
            }
        }

        List<SalesTrendPointDto> result = new ArrayList<>();
        for (int d = 1; d <= daysInMonth; d++) {
            String label = String.valueOf(d);
            String key = date.format(DateTimeFormatter.ofPattern("yyyy-MM-")) + String.format("%02d", d);
            result.add(new SalesTrendPointDto(label, key, dayRevenue[d], dayOrders[d]));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<MenuPerformanceDto> getMenuPerformance(String period, LocalDate targetDate) {
        LocalDate date = targetDate != null ? targetDate : LocalDate.now();
        String periodType = period != null ? period.toUpperCase() : "DAILY";

        LocalDateTime startTime;
        LocalDateTime endTime;

        switch (periodType) {
            case "WEEKLY" -> {
                startTime = date.with(DayOfWeek.MONDAY).atStartOfDay();
                endTime = startTime.plusDays(7);
            }
            case "MONTHLY" -> {
                startTime = date.withDayOfMonth(1).atStartOfDay();
                endTime = startTime.plusMonths(1);
            }
            default -> {
                startTime = date.atStartOfDay();
                endTime = startTime.plusDays(1);
            }
        }

        List<Object[]> rows = orderItemRepo.findMenuPerformance(startTime, endTime);
        Map<Integer, MenuPerformanceDto> salesMap = new HashMap<>();

        for (Object[] row : rows) {
            Integer menuId = (Integer) row[0];
            String name = (String) row[1];
            String category = (String) row[2];
            int unitPrice = row[3] != null ? ((Number) row[3]).intValue() : 0;
            long qty = ((Number) row[4]).longValue();
            long totalRevenue = ((Number) row[5]).longValue();

            salesMap.put(menuId, new MenuPerformanceDto(
                menuId,
                name,
                category != null ? category : "Uncategorized",
                unitPrice,
                qty,
                totalRevenue
            ));
        }

        List<MenuEntity> allMenus = menuRepo.findAll();
        List<MenuPerformanceDto> result = new ArrayList<>();

        for (MenuEntity menu : allMenus) {
            if (salesMap.containsKey(menu.getId())) {
                result.add(salesMap.get(menu.getId()));
            } else {
                String category = menu.getCategoryEntity() != null ? menu.getCategoryEntity().getName() : "Uncategorized";
                result.add(new MenuPerformanceDto(
                    menu.getId(),
                    menu.getName(),
                    category,
                    menu.getPrice(),
                    0L,
                    0L
                ));

            }
        }

        result.sort(Comparator.comparingLong(MenuPerformanceDto::quantitySold).reversed());
        return result;
    }


    @Transactional(readOnly = true)
    public List<CashierBalanceDto> getCashierBalances(LocalDate targetDate) {
        LocalDate date = targetDate != null ? targetDate : LocalDate.now();
        LocalDateTime startTime = date.atStartOfDay();
        LocalDateTime endTime = startTime.plusDays(1);

        List<OrderEntity> orders = orderRepo.findCompletedOrdersForSales(startTime, endTime);

        // Group by UserEntity
        Map<UserEntity, List<OrderEntity>> ordersByUser = orders.stream()
            .filter(o -> o.getUserEntity() != null)
            .collect(Collectors.groupingBy(OrderEntity::getUserEntity));

        List<CashierBalanceDto> result = new ArrayList<>();

        for (Map.Entry<UserEntity, List<OrderEntity>> entry : ordersByUser.entrySet()) {
            UserEntity user = entry.getKey();
            List<OrderEntity> userOrders = entry.getValue();

            int completedCount = userOrders.size();
            long cashRev = 0;
            long onlineRev = 0;
            long totalRev = 0;

            for (OrderEntity o : userOrders) {
                long price = o.getTotalPrice();
                totalRev += price;
                String method = o.getPaymentMethod() != null ? o.getPaymentMethod().toLowerCase() : "cash";
                if ("online".equals(method)) {
                    onlineRev += price;
                } else {
                    cashRev += price;
                }
            }

            result.add(new CashierBalanceDto(
                user.getId(),
                user.getUsername(),
                user.getMobileNumber(),
                completedCount,
                cashRev,
                onlineRev,
                totalRev
            ));
        }

        result.sort((a, b) -> Long.compare(b.totalRevenue(), a.totalRevenue()));
        return result;
    }
}

