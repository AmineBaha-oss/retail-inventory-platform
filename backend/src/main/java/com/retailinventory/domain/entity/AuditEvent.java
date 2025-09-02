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
 * Entity for tracking audit events and state changes.
 */
@Entity
@Table(name = "audit_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType; // INVENTORY, PURCHASE_ORDER, FORECAST, USER, etc.

    @Column(name = "entity_id", nullable = false, length = 255)
    private String entityId; // ID of the entity being audited

    @Column(name = "action", nullable = false, length = 50)
    private String action; // CREATE, UPDATE, DELETE, APPROVE, etc.

    @Column(name = "actor", length = 255)
    private String actor; // User ID or system identifier

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "payload", columnDefinition = "TEXT")
    private String payload; // JSON payload with change details

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
