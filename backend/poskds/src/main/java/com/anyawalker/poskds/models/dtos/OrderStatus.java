package com.anyawalker.poskds.models.dtos;

public enum OrderStatus {
    WAITING("waiting"),
    COOKING("cooking"),
    COMPLETE("completed"),
    CANCEL("cancelled");

    private final String value;

    OrderStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return this.value;
    }
}
