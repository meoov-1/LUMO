package com.lumo.controller;

import com.lumo.dto.ApiResponse;
import com.lumo.dto.CareerPredictionResponse;
import com.lumo.service.CareerService;
import com.lumo.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/career")
@RequiredArgsConstructor
@Slf4j
public class CareerController {

    private final CareerService careerService;
    private final CustomUserDetailsService userDetailsService;

    @GetMapping("/prediction")
    public ResponseEntity<ApiResponse<CareerPredictionResponse>> getLatestPrediction(
            Authentication authentication) {
        
        String email = authentication.getName();
        log.info("Fetching career prediction for user: {}", email);
        
        Long userId = userDetailsService.loadUserEntityByEmail(email).getId();
        CareerPredictionResponse prediction = careerService.getUserLatestPrediction(userId);
        
        return ResponseEntity.ok(ApiResponse.success("Career prediction retrieved", prediction));
    }

    @PostMapping("/generate/{cycle}")
    public ResponseEntity<ApiResponse<CareerPredictionResponse>> generatePrediction(
            @PathVariable Integer cycle,
            Authentication authentication) {
        
        String email = authentication.getName();
        log.info("Manual career prediction generation for user: {} cycle: {}", email, cycle);
        
        Long userId = userDetailsService.loadUserEntityByEmail(email).getId();
        CareerPredictionResponse prediction = careerService.generateCareerPrediction(userId, cycle);
        
        return ResponseEntity.ok(ApiResponse.success("Career prediction generated", prediction));
    }
}
