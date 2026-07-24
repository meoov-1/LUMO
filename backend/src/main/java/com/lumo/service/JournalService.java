package com.lumo.service;

import com.lumo.dto.JournalEntryResponse;
import com.lumo.dto.JournalSubmitRequest;
import com.lumo.entity.JournalEntry;
import com.lumo.entity.User;
import com.lumo.exception.JournalCooldownException;
import com.lumo.repository.JournalEntryRepository;
import com.lumo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JournalService {

    private final JournalEntryRepository journalEntryRepository;
    private final UserRepository userRepository;
    private final CareerService careerService;

    private static final long COOLDOWN_HOURS = 24;

    @Transactional
    public JournalEntryResponse submitJournal(String email, JournalSubmitRequest request) {
        log.info("Processing journal submission for user: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check 24-hour cooldown
        if (user.getLastJournalTimestamp() != null) {
            Instant nextAvailableTime = user.getLastJournalTimestamp().plus(Duration.ofHours(COOLDOWN_HOURS));
            Instant now = Instant.now();

            if (now.isBefore(nextAvailableTime)) {
                long secondsRemaining = Duration.between(now, nextAvailableTime).getSeconds();
                throw new JournalCooldownException(
                    "You can only write 1 reflection entry per 24 hours. Please wait until " + nextAvailableTime,
                    nextAvailableTime,
                    secondsRemaining
                );
            }
        }

        // Increment level
        int newLevel = user.getCurrentLevel() + 1;
        boolean cycleCompleted = newLevel > 30;

        if (cycleCompleted) {
            newLevel = 1; // Start new level in new cycle
        }

        // Create journal entry
        JournalEntry entry = JournalEntry.builder()
                .userId(user.getId())
                .cycle(user.getCurrentCycle())
                .level(newLevel)
                .content(request.getContent())
                .moodTag(request.getMoodTag())
                .reflectionScore(request.getReflectionScore())
                .build();

        entry = journalEntryRepository.save(entry);
        log.info("Journal entry saved: ID={}, Level={}, Cycle={}", entry.getId(), newLevel, user.getCurrentCycle());

        // Update user
        user.setCurrentLevel(newLevel);
        user.setLastJournalTimestamp(Instant.now());

        // Handle cycle completion
        if (cycleCompleted) {
            log.info("User {} completed cycle {}. Triggering AI Career Prediction...", email, user.getCurrentCycle());
            
            // Trigger AI Career Path Synthesis
            try {
                careerService.generateCareerPrediction(user.getId(), user.getCurrentCycle());
            } catch (Exception e) {
                log.error("Failed to generate career prediction for user {}: {}", user.getId(), e.getMessage(), e);
                // Don't fail the journal submission if AI generation fails
            }
            
            // Increment cycle and reset level
            user.setCurrentCycle(user.getCurrentCycle() + 1);
            user.setCurrentLevel(0);
            
            log.info("User {} advanced to cycle {}", email, user.getCurrentCycle());
        }

        userRepository.save(user);

        return mapToResponse(entry);
    }

    public List<JournalEntryResponse> getJournalHistory(String email, Integer cycle) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<JournalEntry> entries;
        if (cycle != null) {
            entries = journalEntryRepository.findByUserIdAndCycleOrderByLevelAsc(user.getId(), cycle);
        } else {
            entries = journalEntryRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        }

        return entries.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private JournalEntryResponse mapToResponse(JournalEntry entry) {
        return JournalEntryResponse.builder()
                .id(entry.getId())
                .cycle(entry.getCycle())
                .level(entry.getLevel())
                .content(entry.getContent())
                .moodTag(entry.getMoodTag())
                .reflectionScore(entry.getReflectionScore())
                .createdAt(entry.getCreatedAt())
                .build();
    }
}
