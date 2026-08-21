package com.anyawalker.poskds.features.preorder;

import com.anyawalker.poskds.features.preorder.dtos.PreOrderDto.*;
import com.anyawalker.poskds.features.preorder.exceptions.PreOrderNotFoundException;
import com.anyawalker.poskds.models.MenuEntity;
import com.anyawalker.poskds.repos.MenuRepo;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.Spy;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.List;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class PreOrderServiceTest {

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @Mock
    private MenuRepo menuRepo;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private PreOrderService preOrderService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    void createPreOrder_ShouldStoreCleanJsonInRedisAndReturnBase64QrCode() {
        CreateRequest request = new CreateRequest(List.of(
                new ItemRequest(1, 2, "Less sugar"),
                new ItemRequest(2, 1, null)
        ));

        when(redisTemplate.hasKey(anyString())).thenReturn(false);

        CreateResponse response = preOrderService.createPreOrder(request);

        assertNotNull(response);
        assertNotNull(response.code());
        assertEquals(6, response.code().length());
        assertNotNull(response.qrImageBase64());
        assertTrue(response.qrImageBase64().startsWith("data:image/png;base64,"));
        assertEquals(1800, response.expiresInSeconds());

        verify(valueOperations, times(1)).set(
                eq("pre_order:" + response.code()),
                anyString(),
                eq(30L),
                eq(TimeUnit.MINUTES)
        );
    }

    @Test
    void getPreOrderByCode_WhenExists_ShouldQueryPostgresAndReturnDetails() throws Exception {
        String code = "123456";
        String redisKey = "pre_order:123456";

        RedisDraft draft = new RedisDraft(
                code,
                "data:image/png;base64,mockqr",
                List.of(
                        new ItemRequest(1, 2, "Less sugar"),
                        new ItemRequest(2, 1, null)
                ),
                System.currentTimeMillis()
        );

        String jsonString = objectMapper.writeValueAsString(draft);
        when(valueOperations.get(redisKey)).thenReturn(jsonString);

        MenuEntity menu1 = new MenuEntity();
        menu1.setId(1);
        menu1.setName("Iced Americano");
        menu1.setPrice(3000);
        menu1.setImageUrl("https://cloudinary.com/americano.jpg");
        menu1.setAvailable(true);
        menu1.setDeleted(false);

        MenuEntity menu2 = new MenuEntity();
        menu2.setId(2);
        menu2.setName("Croissant");
        menu2.setPrice(2500);
        menu2.setImageUrl("https://cloudinary.com/croissant.jpg");
        menu2.setAvailable(true);
        menu2.setDeleted(false);

        when(menuRepo.findAllById(List.of(1, 2))).thenReturn(List.of(menu1, menu2));

        DetailsResponse response = preOrderService.getPreOrderByCode(code);

        assertNotNull(response);
        assertEquals("123456", response.code());
        assertEquals(2, response.items().size());
        assertEquals(8500, response.subtotalPrice()); // (3000*2) + (2500*1) = 8500
        assertEquals(425, response.taxAmount());      // 8500 * 0.05 = 425
        assertEquals(8925, response.totalPrice());     // 8500 + 425 = 8925
        assertTrue(response.allItemsAvailable());

        verify(menuRepo, times(1)).findAllById(List.of(1, 2));
    }

    @Test
    void getPreOrderByCode_WhenItemUnavailable_ShouldFlagAllItemsAvailableFalse() throws Exception {
        String code = "123456";
        String redisKey = "pre_order:123456";

        RedisDraft draft = new RedisDraft(
                code,
                "data:image/png;base64,mockqr",
                List.of(
                        new ItemRequest(1, 1, null)
                ),
                System.currentTimeMillis()
        );

        String jsonString = objectMapper.writeValueAsString(draft);
        when(valueOperations.get(redisKey)).thenReturn(jsonString);

        MenuEntity menu1 = new MenuEntity();
        menu1.setId(1);
        menu1.setName("Sold-out Latte");
        menu1.setPrice(4000);
        menu1.setAvailable(false); // OUT OF STOCK
        menu1.setDeleted(false);

        when(menuRepo.findAllById(List.of(1))).thenReturn(List.of(menu1));

        DetailsResponse response = preOrderService.getPreOrderByCode(code);

        assertNotNull(response);
        assertFalse(response.allItemsAvailable());
        assertFalse(response.items().get(0).isAvailable());
    }

    @Test
    void getPreOrderByCode_WhenNotFoundInRedis_ShouldThrowPreOrderNotFoundException() {
        String code = "999999";
        when(valueOperations.get("pre_order:999999")).thenReturn(null);

        assertThrows(PreOrderNotFoundException.class, () -> preOrderService.getPreOrderByCode(code));
        verify(menuRepo, never()).findAllById(any());
    }

    @Test
    void deletePreOrder_ShouldCallRedisDelete() {
        String code = "123456";
        preOrderService.deletePreOrder(code);

        verify(redisTemplate, times(1)).delete("pre_order:123456");
    }
}
