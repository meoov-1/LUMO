package com.lumo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "career_predictions", indexes = {
    @Index(name = "idx_user_cycle", columnList = "user_id, cycle")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CareerPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Integer cycle;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> topCareers;

    @Column(columnDefinition = "TEXT")
    private String strengthsSummary;

    @Column(columnDefinition = "TEXT")
    private String growthRoadmap;

    @Column(columnDefinition = "TEXT")
    private String fullAnalysis;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant generatedAt;
}
