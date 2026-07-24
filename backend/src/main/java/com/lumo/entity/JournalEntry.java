package com.lumo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "journal_entries", indexes = {
    @Index(name = "idx_user_cycle", columnList = "user_id, cycle"),
    @Index(name = "idx_user_created", columnList = "user_id, created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JournalEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Integer cycle;

    @Column(nullable = false)
    private Integer level; // 1 to 30

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(length = 50)
    private String moodTag;

    @Column
    private Integer reflectionScore;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
