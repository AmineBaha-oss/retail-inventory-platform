package com.retailinventory.domain.repository;

import com.retailinventory.domain.entity.SalesTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface SalesTransactionRepository extends JpaRepository<SalesTransaction, UUID> {

    List<SalesTransaction> findByStoreId(UUID storeId);
    
    List<SalesTransaction> findByProductId(UUID productId);
    
    List<SalesTransaction> findByStoreIdAndProductId(UUID storeId, UUID productId);
    
    @Query("SELECT s FROM SalesTransaction s WHERE s.transactionDate BETWEEN :startDate AND :endDate")
    List<SalesTransaction> findByTransactionDateBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT s FROM SalesTransaction s WHERE s.storeId = :storeId AND s.transactionDate BETWEEN :startDate AND :endDate")
    List<SalesTransaction> findByStoreIdAndTransactionDateBetween(@Param("storeId") UUID storeId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT s FROM SalesTransaction s WHERE s.externalOrderId = :externalOrderId")
    List<SalesTransaction> findByExternalOrderId(@Param("externalOrderId") String externalOrderId);
}
