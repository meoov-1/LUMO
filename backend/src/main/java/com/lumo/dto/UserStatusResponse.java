package com.lumo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStatusResponse {
    private Long userId;
    private String email;
    private String fullName;
    private Integer currentCycle;
    private Integer currentLevel; // 0 to 30
    private Instant lastJournalTimestamp;
    private Long timeRemainingUntilNextLevel; // in seconds, null if can journal now
    private Instant nextAvailableTime;
    private boolean canJournalNow;
}
