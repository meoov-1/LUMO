package com.lumo.exception;

import lombok.Getter;

import java.time.Instant;

@Getter
public class JournalCooldownException extends RuntimeException {
    private final Instant nextAvailableTime;
    private final long secondsRemaining;

    public JournalCooldownException(String message, Instant nextAvailableTime, long secondsRemaining) {
        super(message);
        this.nextAvailableTime = nextAvailableTime;
        this.secondsRemaining = secondsRemaining;
    }
}
