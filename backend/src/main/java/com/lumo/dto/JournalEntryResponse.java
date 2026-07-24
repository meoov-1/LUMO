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
public class JournalEntryResponse {
    private Long id;
    private Integer cycle;
    private Integer level;
    private String content;
    private String moodTag;
    private Integer reflectionScore;
    private Instant createdAt;
}
