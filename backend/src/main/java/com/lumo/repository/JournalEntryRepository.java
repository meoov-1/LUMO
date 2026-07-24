package com.lumo.repository;

import com.lumo.entity.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {
    
    List<JournalEntry> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<JournalEntry> findByUserIdAndCycleOrderByLevelAsc(Long userId, Integer cycle);
    
    long countByUserIdAndCycle(Long userId, Integer cycle);
}
