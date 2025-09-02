package com.retailinventory.infrastructure.repository;

import com.retailinventory.domain.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, UUID> {

    @Query("SELECT i FROM Inventory i WHERE i.store.id = :storeId AND i.product.id = :productId " +
           "ORDER BY i.recordedAt DESC LIMIT 1")
    Optional<Inventory> findLatestByStoreAndProduct(@Param("storeId") UUID storeId, @Param("productId") UUID productId);
    
    @Query("SELECT i FROM Inventory i WHERE i.store.id = :storeId ORDER BY i.recordedAt DESC")
    List<Inventory> findLatestByStore(@Param("storeId") UUID storeId);
    
    @Query("SELECT i FROM Inventory i WHERE i.product.id = :productId ORDER BY i.recordedAt DESC")
    List<Inventory> findByProduct(@Param("productId") UUID productId);
    
    @Query("SELECT i FROM Inventory i WHERE i.store.id = :storeId AND i.quantityAvailable <= i.reorderPoint")
    List<Inventory> findLowStockByStore(@Param("storeId") UUID storeId);
    
    @Query("SELECT i FROM Inventory i WHERE i.quantityAvailable <= 0")
    List<Inventory> findStockOuts();
    
    @Query("SELECT i FROM Inventory i WHERE i.store.id = :storeId AND i.quantityAvailable <= 0")
    List<Inventory> findStockOutsByStore(@Param("storeId") UUID storeId);
    
    @Query("SELECT i FROM Inventory i WHERE i.store.id = :storeId AND " +
           "i.recordedAt BETWEEN :startDate AND :endDate ORDER BY i.recordedAt")
    List<Inventory> findByStoreAndDateRange(
        @Param("storeId") UUID storeId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    @Query("SELECT SUM(i.quantityOnHand * i.costPerUnit) FROM Inventory i WHERE i.store.id = :storeId " +
           "AND i.recordedAt = (SELECT MAX(i2.recordedAt) FROM Inventory i2 WHERE i2.store.id = i.store.id AND i2.product.id = i.product.id)")
    Double calculateTotalInventoryValueByStore(@Param("storeId") UUID storeId);
    
    @Query("SELECT COUNT(DISTINCT i.product.id) FROM Inventory i WHERE i.store.id = :storeId AND i.quantityAvailable <= i.reorderPoint")
    Long countLowStockItemsByStore(@Param("storeId") UUID storeId);
    
    @Query("SELECT COUNT(DISTINCT i.product.id) FROM Inventory i WHERE i.store.id = :storeId AND i.quantityAvailable <= 0")
    Long countStockOutsByStore(@Param("storeId") UUID storeId);
    
    boolean existsByIdempotencyKey(String idempotencyKey);
}
