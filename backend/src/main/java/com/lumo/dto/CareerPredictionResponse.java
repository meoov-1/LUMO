package com.lumo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CareerPredictionResponse {
    private Long id;
    private Integer cycle;
    private List<String> topCareers;
    private String strengthsSummary;
    private String growthRoadmap;
    private String fullAnalysis;
    private Instant generatedAt;
}
