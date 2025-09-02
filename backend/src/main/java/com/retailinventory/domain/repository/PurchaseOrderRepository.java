package com.retailinventory.domain.repository;

import com.retailinventory.domain.entity.PurchaseOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, UUID> {

    Optional<PurchaseOrder> findByPoNumber(String poNumber);
    
    boolean existsByPoNumber(String poNumber);
    
    List<PurchaseOrder> findByStatus(PurchaseOrder.PurchaseOrderStatus status);
    
    @Query("SELECT po FROM PurchaseOrder po WHERE po.store.id = :storeId")
    List<PurchaseOrder> findByStoreId(@Param("storeId") UUID storeId);
    
    @Query("SELECT po FROM PurchaseOrder po WHERE po.supplier.id = :supplierId")
    List<PurchaseOrder> findBySupplierId(@Param("supplierId") UUID supplierId);
    
    @Query("SELECT po FROM PurchaseOrder po WHERE po.store.id = :storeId AND po.status = :status")
    List<PurchaseOrder> findByStoreAndStatus(@Param("storeId") UUID storeId, @Param("status") PurchaseOrder.PurchaseOrderStatus status);
    
    @Query("SELECT po FROM PurchaseOrder po WHERE po.supplier.id = :supplierId AND po.status = :status")
    List<PurchaseOrder> findBySupplierAndStatus(@Param("supplierId") UUID supplierId, @Param("status") PurchaseOrder.PurchaseOrderStatus status);
    
    @Query("SELECT po FROM PurchaseOrder po WHERE po.status = :status AND po.priority = :priority")
    List<PurchaseOrder> findByStatusAndPriority(@Param("status") PurchaseOrder.PurchaseOrderStatus status, @Param("priority") PurchaseOrder.Priority priority);
    
    @Query("SELECT po FROM PurchaseOrder po WHERE po.expectedDeliveryDate BETWEEN :startDate AND :endDate")
    List<PurchaseOrder> findByExpectedDeliveryDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT po FROM PurchaseOrder po WHERE po.expectedDeliveryDate <= :date AND po.status IN ('APPROVED', 'PROCESSING', 'IN_TRANSIT')")
    List<PurchaseOrder> findOverdueOrders(@Param("date") LocalDate date);
    
    @Query("SELECT po FROM PurchaseOrder po WHERE po.store.id = :storeId AND po.createdAt BETWEEN :startDate AND :endDate")
    List<PurchaseOrder> findByStoreAndCreatedBetween(
        @Param("storeId") UUID storeId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    @Query("SELECT po FROM PurchaseOrder po WHERE po.status = 'PENDING_APPROVAL' ORDER BY po.priority DESC, po.createdAt ASC")
    List<PurchaseOrder> findPendingApprovalOrders();
    
    @Query("SELECT po FROM PurchaseOrder po WHERE po.approvedBy = :userId ORDER BY po.approvedAt DESC")
    List<PurchaseOrder> findOrdersApprovedBy(@Param("userId") UUID userId);
    
    @Query("SELECT SUM(po.totalAmount) FROM PurchaseOrder po WHERE po.store.id = :storeId AND po.status NOT IN ('CANCELLED', 'REJECTED')")
    Double calculateTotalPendingAmountByStore(@Param("storeId") UUID storeId);
    
    @Query("SELECT COUNT(po) FROM PurchaseOrder po WHERE po.status = 'PENDING_APPROVAL'")
    Long countPendingApprovalOrders();
    
    @Query("SELECT COUNT(po) FROM PurchaseOrder po WHERE po.store.id = :storeId AND po.status = :status")
    Long countByStoreAndStatus(@Param("storeId") UUID storeId, @Param("status") PurchaseOrder.PurchaseOrderStatus status);
    
    @Query("SELECT po FROM PurchaseOrder po WHERE po.store.id = :storeId ORDER BY po.createdAt DESC")
    Page<PurchaseOrder> findByStoreIdOrderByCreatedAtDesc(@Param("storeId") UUID storeId, Pageable pageable);
    
    @Query("SELECT po FROM PurchaseOrder po WHERE po.supplier.id = :supplierId ORDER BY po.createdAt DESC")
    Page<PurchaseOrder> findBySupplierIdOrderByCreatedAtDesc(@Param("supplierId") UUID supplierId, Pageable pageable);
    
    // Additional methods for compatibility
    // Note: Use findByStoreAndStatus instead of findByStoreIdAndStatus
    // since PurchaseOrder has @ManyToOne Store store, not UUID storeId
}
