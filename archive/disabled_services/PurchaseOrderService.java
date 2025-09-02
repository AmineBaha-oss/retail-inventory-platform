package com.retailinventory.application.service;

import com.retailinventory.domain.entity.PurchaseOrder;
import com.retailinventory.domain.entity.PurchaseOrderItem;
import com.retailinventory.domain.entity.Product;
import com.retailinventory.domain.entity.Supplier;
import com.retailinventory.domain.entity.Store;
import com.retailinventory.infrastructure.repository.PurchaseOrderRepository;
import com.retailinventory.infrastructure.repository.ProductRepository;
import com.retailinventory.infrastructure.repository.SupplierRepository;
import com.retailinventory.infrastructure.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final StoreRepository storeRepository;

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('purchase_order:read')")
    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('purchase_order:read')")
    public PurchaseOrder getPurchaseOrderById(UUID id) {
        return purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase order not found with id: " + id));
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('purchase_order:read')")
    public PurchaseOrder getPurchaseOrderByNumber(String poNumber) {
        return purchaseOrderRepository.findByPoNumber(poNumber)
                .orElseThrow(() -> new RuntimeException("Purchase order not found with number: " + poNumber));
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('purchase_order:read')")
    public List<PurchaseOrder> getPurchaseOrdersByStore(UUID storeId) {
        return purchaseOrderRepository.findByStoreId(storeId);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('purchase_order:read')")
    public List<PurchaseOrder> getPurchaseOrdersBySupplier(UUID supplierId) {
        return purchaseOrderRepository.findBySupplierId(supplierId);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('purchase_order:read')")
    public List<PurchaseOrder> getPurchaseOrdersByStatus(PurchaseOrder.PurchaseOrderStatus status) {
        return purchaseOrderRepository.findByStatus(status);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('purchase_order:read')")
    public List<PurchaseOrder> getPendingApprovalOrders() {
        return purchaseOrderRepository.findPendingApprovalOrders();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('purchase_order:read')")
    public Page<PurchaseOrder> getPurchaseOrdersByStorePaged(UUID storeId, Pageable pageable) {
        return purchaseOrderRepository.findByStoreIdOrderByCreatedAtDesc(storeId, pageable);
    }

    @Transactional
    @PreAuthorize("hasAuthority('purchase_order:create')")
    public PurchaseOrder createPurchaseOrder(PurchaseOrder purchaseOrder) {
        // Validate supplier exists
        Supplier supplier = supplierRepository.findById(purchaseOrder.getSupplier().getId())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
        purchaseOrder.setSupplier(supplier);

        // Validate store exists
        Store store = storeRepository.findById(purchaseOrder.getStore().getId())
                .orElseThrow(() -> new RuntimeException("Store not found"));
        purchaseOrder.setStore(store);

        // Generate PO number if not provided
        if (purchaseOrder.getPoNumber() == null || purchaseOrder.getPoNumber().trim().isEmpty()) {
            purchaseOrder.setPoNumber(generatePONumber());
        }

        // Check if PO number already exists
        if (purchaseOrderRepository.existsByPoNumber(purchaseOrder.getPoNumber())) {
            throw new RuntimeException("Purchase order with number " + purchaseOrder.getPoNumber() + " already exists");
        }

        // Set initial status
        purchaseOrder.setStatus(PurchaseOrder.PurchaseOrderStatus.DRAFT);
        purchaseOrder.setTotalAmount(BigDecimal.ZERO);

        // Calculate total from items
        if (purchaseOrder.getItems() != null && !purchaseOrder.getItems().isEmpty()) {
            recalculateTotal(purchaseOrder);
        }

        log.info("Creating new purchase order: {}", purchaseOrder.getPoNumber());
        return purchaseOrderRepository.save(purchaseOrder);
    }

    @Transactional
    @PreAuthorize("hasAuthority('purchase_order:update')")
    public PurchaseOrder updatePurchaseOrder(UUID id, PurchaseOrder purchaseOrderDetails) {
        PurchaseOrder purchaseOrder = getPurchaseOrderById(id);

        // Only allow updates if in DRAFT status
        if (purchaseOrder.getStatus() != PurchaseOrder.PurchaseOrderStatus.DRAFT) {
            throw new RuntimeException("Cannot update purchase order in status: " + purchaseOrder.getStatus());
        }

        // Update fields
        if (purchaseOrderDetails.getExpectedDeliveryDate() != null) {
            purchaseOrder.setExpectedDeliveryDate(purchaseOrderDetails.getExpectedDeliveryDate());
        }
        if (purchaseOrderDetails.getPriority() != null) {
            purchaseOrder.setPriority(purchaseOrderDetails.getPriority());
        }
        if (purchaseOrderDetails.getNotes() != null) {
            purchaseOrder.setNotes(purchaseOrderDetails.getNotes());
        }

        // Update items if provided
        if (purchaseOrderDetails.getItems() != null) {
            purchaseOrder.getItems().clear();
            for (PurchaseOrderItem item : purchaseOrderDetails.getItems()) {
                // Validate product exists
                Product product = productRepository.findById(item.getProduct().getId())
                        .orElseThrow(() -> new RuntimeException("Product not found"));
                item.setProduct(product);
                purchaseOrder.addItem(item);
            }
            recalculateTotal(purchaseOrder);
        }

        log.info("Updating purchase order: {}", purchaseOrder.getPoNumber());
        return purchaseOrderRepository.save(purchaseOrder);
    }

    @Transactional
    @PreAuthorize("hasAuthority('purchase_order:approve')")
    public PurchaseOrder approvePurchaseOrder(UUID id, UUID approvedBy) {
        PurchaseOrder purchaseOrder = getPurchaseOrderById(id);

        if (purchaseOrder.getStatus() != PurchaseOrder.PurchaseOrderStatus.PENDING_APPROVAL) {
            throw new RuntimeException("Purchase order must be in PENDING_APPROVAL status to be approved");
        }

        purchaseOrder.setStatus(PurchaseOrder.PurchaseOrderStatus.APPROVED);
        purchaseOrder.setApprovedBy(approvedBy);
        purchaseOrder.setApprovedAt(LocalDateTime.now());

        log.info("Purchase order approved: {} by user: {}", purchaseOrder.getPoNumber(), approvedBy);
        return purchaseOrderRepository.save(purchaseOrder);
    }

    @Transactional
    @PreAuthorize("hasAuthority('purchase_order:approve')")
    public PurchaseOrder rejectPurchaseOrder(UUID id, String rejectionReason) {
        PurchaseOrder purchaseOrder = getPurchaseOrderById(id);

        if (purchaseOrder.getStatus() != PurchaseOrder.PurchaseOrderStatus.PENDING_APPROVAL) {
            throw new RuntimeException("Purchase order must be in PENDING_APPROVAL status to be rejected");
        }

        purchaseOrder.setStatus(PurchaseOrder.PurchaseOrderStatus.REJECTED);
        purchaseOrder.setNotes((purchaseOrder.getNotes() != null ? purchaseOrder.getNotes() + "\n" : "") + 
                              "REJECTED: " + rejectionReason);

        log.info("Purchase order rejected: {} - Reason: {}", purchaseOrder.getPoNumber(), rejectionReason);
        return purchaseOrderRepository.save(purchaseOrder);
    }

    @Transactional
    @PreAuthorize("hasAuthority('purchase_order:update')")
    public PurchaseOrder submitForApproval(UUID id) {
        PurchaseOrder purchaseOrder = getPurchaseOrderById(id);

        if (purchaseOrder.getStatus() != PurchaseOrder.PurchaseOrderStatus.DRAFT) {
            throw new RuntimeException("Purchase order must be in DRAFT status to submit for approval");
        }

        if (purchaseOrder.getItems() == null || purchaseOrder.getItems().isEmpty()) {
            throw new RuntimeException("Cannot submit purchase order without items");
        }

        purchaseOrder.setStatus(PurchaseOrder.PurchaseOrderStatus.PENDING_APPROVAL);

        log.info("Purchase order submitted for approval: {}", purchaseOrder.getPoNumber());
        return purchaseOrderRepository.save(purchaseOrder);
    }

    @Transactional
    @PreAuthorize("hasAuthority('purchase_order:update')")
    public PurchaseOrder sendPurchaseOrder(UUID id) {
        PurchaseOrder purchaseOrder = getPurchaseOrderById(id);

        if (purchaseOrder.getStatus() != PurchaseOrder.PurchaseOrderStatus.APPROVED) {
            throw new RuntimeException("Purchase order must be in APPROVED status to be sent");
        }

        purchaseOrder.setStatus(PurchaseOrder.PurchaseOrderStatus.PROCESSING);
        purchaseOrder.setSentAt(LocalDateTime.now());

        log.info("Purchase order sent to supplier: {}", purchaseOrder.getPoNumber());
        return purchaseOrderRepository.save(purchaseOrder);
    }

    @Transactional
    @PreAuthorize("hasAuthority('purchase_order:update')")
    public PurchaseOrder receivePurchaseOrder(UUID id) {
        PurchaseOrder purchaseOrder = getPurchaseOrderById(id);

        if (purchaseOrder.getStatus() != PurchaseOrder.PurchaseOrderStatus.IN_TRANSIT) {
            throw new RuntimeException("Purchase order must be in IN_TRANSIT status to be received");
        }

        purchaseOrder.setStatus(PurchaseOrder.PurchaseOrderStatus.DELIVERED);
        purchaseOrder.setActualDeliveryDate(LocalDate.now());
        purchaseOrder.setReceivedAt(LocalDateTime.now());

        log.info("Purchase order received: {}", purchaseOrder.getPoNumber());
        return purchaseOrderRepository.save(purchaseOrder);
    }

    @Transactional
    @PreAuthorize("hasAuthority('purchase_order:delete')")
    public void cancelPurchaseOrder(UUID id) {
        PurchaseOrder purchaseOrder = getPurchaseOrderById(id);

        if (purchaseOrder.getStatus() != PurchaseOrder.PurchaseOrderStatus.DRAFT) {
            throw new RuntimeException("Only DRAFT purchase orders can be cancelled");
        }

        purchaseOrder.setStatus(PurchaseOrder.PurchaseOrderStatus.CANCELLED);
        purchaseOrderRepository.save(purchaseOrder);

        log.info("Purchase order cancelled: {}", purchaseOrder.getPoNumber());
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('purchase_order:read')")
    public List<PurchaseOrder> getOverdueOrders() {
        return purchaseOrderRepository.findOverdueOrders(LocalDate.now());
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('purchase_order:read')")
    public List<PurchaseOrder> getOrdersByDateRange(LocalDate startDate, LocalDate endDate) {
        return purchaseOrderRepository.findByExpectedDeliveryDateBetween(startDate, endDate);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('purchase_order:read')")
    public Long getPendingApprovalCount() {
        return purchaseOrderRepository.countPendingApprovalOrders();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('purchase_order:read')")
    public BigDecimal getTotalPendingAmount(UUID storeId) {
        Double totalAmount = purchaseOrderRepository.calculateTotalPendingAmountByStore(storeId);
        return totalAmount != null ? BigDecimal.valueOf(totalAmount) : BigDecimal.ZERO;
    }

    private void recalculateTotal(PurchaseOrder purchaseOrder) {
        BigDecimal total = BigDecimal.ZERO;
        for (PurchaseOrderItem item : purchaseOrder.getItems()) {
            total = total.add(item.getTotalCost());
        }
        purchaseOrder.setTotalAmount(total);
    }

    private String generatePONumber() {
        String prefix = "PO";
        String timestamp = String.valueOf(System.currentTimeMillis()).substring(8); // Last 4 digits
        return prefix + "-" + timestamp;
    }
}
