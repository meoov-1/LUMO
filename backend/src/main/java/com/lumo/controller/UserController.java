package com.lumo.controller;

import com.lumo.dto.ApiResponse;
import com.lumo.dto.UserStatusResponse;
import com.lumo.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<UserStatusResponse>> getUserStatus(Authentication authentication) {
        String email = authentication.getName();
        log.info("Fetching status for user: {}", email);
        
        UserStatusResponse status = userService.getUserStatus(email);
        return ResponseEntity.ok(ApiResponse.success("User status retrieved", status));
    }
}
