package com.lumo.controller;

import com.lumo.dto.ApiResponse;
import com.lumo.dto.JournalEntryResponse;
import com.lumo.dto.JournalSubmitRequest;
import com.lumo.service.JournalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/journal")
@RequiredArgsConstructor
@Slf4j
public class JournalController {

    private final JournalService journalService;

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<JournalEntryResponse>> submitJournal(
            @Valid @RequestBody JournalSubmitRequest request,
            Authentication authentication) {
        
        String email = authentication.getName();
        log.info("Journal submission request from user: {}", email);
        
        JournalEntryResponse response = journalService.submitJournal(email, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Journal entry submitted successfully", response));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<JournalEntryResponse>>> getJournalHistory(
            @RequestParam(required = false) Integer cycle,
            Authentication authentication) {
        
        String email = authentication.getName();
        log.info("Fetching journal history for user: {} (cycle: {})", email, cycle);
        
        List<JournalEntryResponse> history = journalService.getJournalHistory(email, cycle);
        return ResponseEntity.ok(ApiResponse.success("Journal history retrieved", history));
    }
}
