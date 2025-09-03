package com.retailinventory.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity for tracking webhook events from external systems.
 */
@Entity
@Table(name = "webhook_events", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"source", "external_event_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebhookEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "source", nullable = false, length = 50)
    private String source; // shopify, lightspeed, etc.

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType; // order, inventory, etc.

    @Column(name = "external_event_id", length = 255)
    private String externalEventId; // External system's event ID for idempotency

    @Column(name = "shop_domain", length = 255)
    private String shopDomain;

    @Column(name = "payload", columnDefinition = "TEXT")
    private String payload;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "PROCESSED";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
