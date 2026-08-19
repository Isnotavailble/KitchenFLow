package com.anyawalker.poskds.features.account.exceptions;

public class MobileAlreadyExistsException extends RuntimeException {
    public MobileAlreadyExistsException(String message) {
        super(message);
    }
}
