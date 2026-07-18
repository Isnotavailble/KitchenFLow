package com.anyawalker.poskds.features.order.dtos;

public enum OrderWorkloadTier {
    LIGHT("light"),
    MEDIUM("medium"),
    HEAVY("heavy");
    private final String s;
    OrderWorkloadTier(String s) {
        this.s = s;
    }
    public String getValue(){return this.s;}
}
