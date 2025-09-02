package com.retailinventory.domain.repository;

import com.retailinventory.domain.entity.AuditEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AuditEventRepository extends JpaRepository<AuditEvent, UUID> {

    List<AuditEvent> findByEntityType(String entityType);
    
    List<AuditEvent> findByEntityId(String entityId);
    
    List<AuditEvent> findByActor(String actor);
    
    List<AuditEvent> findByAction(String action);
    
    @Query("SELECT a FROM AuditEvent a WHERE a.timestamp >= :since")
    List<AuditEvent> findRecentEvents(@Param("since") LocalDateTime since);
    
    @Query("SELECT a FROM AuditEvent a WHERE a.entityType = :entityType AND a.entityId = :entityId ORDER BY a.timestamp DESC")
    List<AuditEvent> findByEntityTypeAndEntityId(@Param("entityType") String entityType, @Param("entityId") String entityId);
    
    @Query("SELECT a FROM AuditEvent a WHERE a.actor = :actor AND a.timestamp >= :since")
    List<AuditEvent> findByActorAndTimestampAfter(@Param("actor") String actor, @Param("since") LocalDateTime since);
    
    @Query("SELECT a FROM AuditEvent a WHERE a.timestamp BETWEEN :startDate AND :endDate ORDER BY a.timestamp DESC")
    List<AuditEvent> findByTimestampBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
