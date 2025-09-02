package com.retailinventory.domain.repository;

import com.retailinventory.domain.entity.WebhookEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface WebhookEventRepository extends JpaRepository<WebhookEvent, UUID> {

    List<WebhookEvent> findBySource(String source);
    
    List<WebhookEvent> findByEventType(String eventType);
    
    List<WebhookEvent> findByShopDomain(String shopDomain);
    
    @Query("SELECT w FROM WebhookEvent w WHERE w.processedAt >= :since")
    List<WebhookEvent> findRecentEvents(@Param("since") LocalDateTime since);
    
    @Query("SELECT w FROM WebhookEvent w WHERE w.source = :source AND w.eventType = :eventType")
    List<WebhookEvent> findBySourceAndEventType(@Param("source") String source, @Param("eventType") String eventType);
}
