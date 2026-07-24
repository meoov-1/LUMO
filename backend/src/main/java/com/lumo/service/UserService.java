package com.lumo.service;

import com.lumo.dto.UserStatusResponse;
import com.lumo.entity.User;
import com.lumo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private static final long COOLDOWN_HOURS = 24;

    public UserStatusResponse getUserStatus(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Instant nextAvailableTime = null;
        Long timeRemaining = null;
        boolean canJournalNow = true;

        if (user.getLastJournalTimestamp() != null) {
            nextAvailableTime = user.getLastJournalTimestamp().plus(Duration.ofHours(COOLDOWN_HOURS));
            Instant now = Instant.now();

            if (now.isBefore(nextAvailableTime)) {
                timeRemaining = Duration.between(now, nextAvailableTime).getSeconds();
                canJournalNow = false;
            }
        }

        return UserStatusResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .currentCycle(user.getCurrentCycle())
                .currentLevel(user.getCurrentLevel())
                .lastJournalTimestamp(user.getLastJournalTimestamp())
                .timeRemainingUntilNextLevel(timeRemaining)
                .nextAvailableTime(nextAvailableTime)
                .canJournalNow(canJournalNow)
                .build();
    }
}
