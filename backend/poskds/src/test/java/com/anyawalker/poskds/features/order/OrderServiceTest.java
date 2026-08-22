package com.anyawalker.poskds.features.order;

import com.anyawalker.poskds.features.order.dtos.OrderResponse;
import com.anyawalker.poskds.features.order.dtos.PaginatedOrderResponse;
import com.anyawalker.poskds.features.order.mappers.OrderMapper;
import com.anyawalker.poskds.models.OrderEntity;
import com.anyawalker.poskds.repos.MenuRepo;
import com.anyawalker.poskds.repos.OrderRepo;
import com.anyawalker.poskds.repos.UserRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class OrderServiceTest {

    @Mock
    private OrderRepo orderRepo;

    @Mock
    private UserRepo userRepo;

    @Mock
    private MenuRepo menuRepo;

    @Mock
    private OrderMapper orderMapper;

    @InjectMocks
    private OrderService orderService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getOrders_WithAllStatus_ShouldQueryWaitingOrdersTodayWithFifo() {
        OrderEntity order = new OrderEntity();
        order.setId(1);
        order.setOrderNumber(101);
        order.setStatus("waiting");
        order.setCreatedAt(LocalDateTime.now().minusMinutes(5));

        OrderResponse orderResponse = new OrderResponse(
                1, 1L, 101, "waiting", "", "light", "takeaway",
                List.of(), 100, 105, 5, order.getCreatedAt(), null
        );

        Page<OrderEntity> page = new PageImpl<>(List.of(order), Pageable.unpaged(), 1);
        when(orderRepo.findOrdersByFilters(any(), any(), eq("waiting"), isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(page);
        when(orderMapper.toResponseDTO(eq(order), anyString())).thenReturn(orderResponse);

        PaginatedOrderResponse result = orderService.getOrders("All", null, null, 0, 20);

        assertNotNull(result);
        assertEquals(1, result.items().size());
        assertEquals(101, result.items().get(0).orderNumber());
        assertEquals(1, result.totalCount());

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        ArgumentCaptor<LocalDateTime> startCaptor = ArgumentCaptor.forClass(LocalDateTime.class);
        ArgumentCaptor<LocalDateTime> endCaptor = ArgumentCaptor.forClass(LocalDateTime.class);

        verify(orderRepo).findOrdersByFilters(
                startCaptor.capture(),
                endCaptor.capture(),
                eq("waiting"),
                isNull(),
                isNull(),
                isNull(),
                pageableCaptor.capture()
        );

        assertEquals(LocalDate.now().atStartOfDay(), startCaptor.getValue());
        assertEquals(LocalDate.now().plusDays(1).atStartOfDay(), endCaptor.getValue());
        assertEquals(Sort.by(Sort.Direction.ASC, "createdAt"), pageableCaptor.getValue().getSort());
    }

    @Test
    void getOrders_WithPriorityStatus_ShouldPassPriorityCutoff() {
        Page<OrderEntity> page = new PageImpl<>(List.of(), Pageable.unpaged(), 0);
        when(orderRepo.findOrdersByFilters(any(), any(), eq("waiting"), notNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(page);

        PaginatedOrderResponse result = orderService.getOrders("Priority", null, null, 0, 20);

        assertNotNull(result);
        assertEquals(0, result.items().size());

        ArgumentCaptor<LocalDateTime> cutoffCaptor = ArgumentCaptor.forClass(LocalDateTime.class);
        verify(orderRepo).findOrdersByFilters(
                any(),
                any(),
                eq("waiting"),
                cutoffCaptor.capture(),
                isNull(),
                isNull(),
                any(Pageable.class)
        );

        assertNotNull(cutoffCaptor.getValue());
        assertTrue(cutoffCaptor.getValue().isBefore(LocalDateTime.now().minusMinutes(9)));
    }

    @Test
    void getOrders_WithCompleteStatus_ShouldQueryCompletedWithLifo() {
        Page<OrderEntity> page = new PageImpl<>(List.of(), Pageable.unpaged(), 0);
        when(orderRepo.findOrdersByFilters(any(), any(), eq("completed"), isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(page);

        PaginatedOrderResponse result = orderService.getOrders("Complete", null, null, 0, 20);

        assertNotNull(result);

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(orderRepo).findOrdersByFilters(
                any(),
                any(),
                eq("completed"),
                isNull(),
                isNull(),
                isNull(),
                pageableCaptor.capture()
        );

        assertEquals(
                Sort.by(Sort.Direction.DESC, "updatedAt").and(Sort.by(Sort.Direction.DESC, "createdAt")),
                pageableCaptor.getValue().getSort()
        );
    }

    @Test
    void getOrders_WithOrderNumberAndCategory_ShouldPassParameters() {
        Page<OrderEntity> page = new PageImpl<>(List.of(), Pageable.unpaged(), 0);
        when(orderRepo.findOrdersByFilters(any(), any(), eq("waiting"), isNull(), eq(42), eq("burgers"), any(Pageable.class)))
                .thenReturn(page);

        PaginatedOrderResponse result = orderService.getOrders("Waiting", 42, "Burgers", 0, 20);

        assertNotNull(result);
        verify(orderRepo).findOrdersByFilters(
                any(),
                any(),
                eq("waiting"),
                isNull(),
                eq(42),
                eq("burgers"),
                any(Pageable.class)
        );
    }

    @Test
    void getCompletedPickupsToday_ShouldQueryNativeQueryAndMap() {
        OrderEntity order = new OrderEntity();
        order.setId(10);
        order.setOrderNumber(501);
        order.setStatus("completed");

        OrderResponse orderResponse = new OrderResponse(
                10, 1L, 501, "completed", "", "light", "takeaway",
                List.of(), 100, 105, 5, LocalDateTime.now(), LocalDateTime.now()
        );

        when(orderRepo.findTodayCompletedOrders(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(order));
        when(orderMapper.toResponseDTO(eq(order), anyString())).thenReturn(orderResponse);

        List<OrderResponse> result = orderService.getCompletedPickupsToday();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(501, result.get(0).orderNumber());
        verify(orderRepo).findTodayCompletedOrders(any(LocalDateTime.class), any(LocalDateTime.class));
    }
}


