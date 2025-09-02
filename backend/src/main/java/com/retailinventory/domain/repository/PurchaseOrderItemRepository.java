package com.retailinventory.domain.repository;

import com.retailinventory.domain.entity.PurchaseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PurchaseOrderItemRepository extends JpaRepository<PurchaseOrderItem, UUID> {

    List<PurchaseOrderItem> findByPurchaseOrderId(UUID purchaseOrderId);
    
    List<PurchaseOrderItem> findByProductId(UUID productId);
    
    @Query("SELECT poi FROM PurchaseOrderItem poi JOIN poi.purchaseOrder po WHERE po.storeId = :storeId")
    List<PurchaseOrderItem> findByStoreId(@Param("storeId") UUID storeId);
    
    @Query("SELECT poi FROM PurchaseOrderItem poi JOIN poi.purchaseOrder po WHERE po.supplierId = :supplierId")
    List<PurchaseOrderItem> findBySupplierId(@Param("supplierId") UUID supplierId);
}
