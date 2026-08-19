package com.anyawalker.poskds.features.preorder;

import com.anyawalker.poskds.features.preorder.dtos.PreOrderDto.*;
import com.anyawalker.poskds.features.preorder.exceptions.PreOrderNotFoundException;
import com.anyawalker.poskds.features.preorder.utils.QrCodeGenerator;
import com.anyawalker.poskds.models.MenuEntity;
import com.anyawalker.poskds.repos.MenuRepo;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class PreOrderService {
    private static final Logger log = LoggerFactory.getLogger(PreOrderService.class);
    public static final String REDIS_PREORDER_PREFIX = "pre_order:";
    public static final long TTL_MINUTES = 30;
    public static final long TTL_SECONDS = TTL_MINUTES * 60;
    private static final double TAX_RATE = 0.05;

    private final RedisTemplate<String, Object> redisTemplate;
    private final MenuRepo menuRepo;
    private final ObjectMapper objectMapper;

    public PreOrderService(RedisTemplate<String, Object> redisTemplate, MenuRepo menuRepo, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.menuRepo = menuRepo;
        this.objectMapper = objectMapper;
    }

    public CreateResponse createPreOrder(CreateRequest request) {
        String code = generateUniqueCode();
        String redisKey = REDIS_PREORDER_PREFIX + code;

        RedisDraft draft = new RedisDraft(request.items(), Instant.now().toEpochMilli());
        try {
            String json = objectMapper.writeValueAsString(draft);
            redisTemplate.opsForValue().set(redisKey, json, TTL_MINUTES, TimeUnit.MINUTES);
            log.info("Stored clean JSON pre-order draft in Redis with key={} and TTL={} mins", redisKey, TTL_MINUTES);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize pre-order draft to JSON", e);
        }

        String qrImageBase64 = QrCodeGenerator.generateQrCodeBase64(code);

        return new CreateResponse(code, qrImageBase64, TTL_SECONDS);
    }

    public DetailsResponse getPreOrderByCode(String code) {
        String redisKey = REDIS_PREORDER_PREFIX + code.trim();
        Object cached = redisTemplate.opsForValue().get(redisKey);

        if (cached == null) {
            throw new PreOrderNotFoundException("Pre-order with code " + code + " not found or has expired");
        }

        RedisDraft draft = parseRedisDraft(cached);
        List<ItemRequest> items = draft.items() != null ? draft.items() : List.of();

        List<Integer> menuIds = items.stream()
                .map(ItemRequest::menuId)
                .distinct()
                .toList();

        Map<Integer, MenuEntity> menuMap = menuRepo.findAllById(menuIds)
                .stream()
                .collect(Collectors.toMap(MenuEntity::getId, m -> m));

        List<ItemDetail> itemDetails = new ArrayList<>();
        int subtotalPrice = 0;
        boolean allItemsAvailable = true;

        for (ItemRequest item : items) {
            MenuEntity menu = menuMap.get(item.menuId());
            if (menu != null && !menu.isDeleted()) {
                int itemSubtotal = menu.getPrice() * item.quantity();
                subtotalPrice += itemSubtotal;
                boolean available = menu.isAvailable();
                if (!available) {
                    allItemsAvailable = false;
                }
                itemDetails.add(new ItemDetail(
                        menu.getId(),
                        menu.getName(),
                        menu.getPrice(),
                        menu.getImageUrl(),
                        item.quantity(),
                        item.itemNote(),
                        itemSubtotal,
                        available
                ));
            } else {
                allItemsAvailable = false;
                itemDetails.add(new ItemDetail(
                        item.menuId(),
                        "Unavailable Item",
                        0,
                        null,
                        item.quantity(),
                        item.itemNote(),
                        0,
                        false
                ));
            }
        }

        int taxAmount = (int) Math.round(subtotalPrice * TAX_RATE);
        int totalPrice = subtotalPrice + taxAmount;

        return new DetailsResponse(code.trim(), itemDetails, subtotalPrice, taxAmount, totalPrice, allItemsAvailable);
    }

    public void deletePreOrder(String code) {
        String redisKey = REDIS_PREORDER_PREFIX + code.trim();
        redisTemplate.delete(redisKey);
        log.info("Deleted pre-order draft key={} from Redis", redisKey);
    }

    private String generateUniqueCode() {
        for (int i = 0; i < 10; i++) {
            int randomNum = ThreadLocalRandom.current().nextInt(100_000, 1_000_000);
            String code = String.valueOf(randomNum);
            Boolean exists = redisTemplate.hasKey(REDIS_PREORDER_PREFIX + code);
            if (Boolean.FALSE.equals(exists)) {
                return code;
            }
        }
        return String.valueOf(System.currentTimeMillis() % 1_000_000);
    }

    private RedisDraft parseRedisDraft(Object obj) {
        try {
            if (obj instanceof String jsonString) {
                return objectMapper.readValue(jsonString, RedisDraft.class);
            }
            return objectMapper.convertValue(obj, RedisDraft.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to deserialize pre-order draft from Redis", e);
        }
    }
}
