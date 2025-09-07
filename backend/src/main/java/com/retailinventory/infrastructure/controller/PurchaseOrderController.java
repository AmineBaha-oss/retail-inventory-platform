package com.retailinventory.infrastructure.controller;

import com.retailinventory.domain.entity.PurchaseOrder;
import com.retailinventory.domain.entity.Store;
import com.retailinventory.domain.entity.Supplier;
import com.retailinventory.domain.repository.PurchaseOrderRepository;
import com.retailinventory.domain.repository.StoreRepository;
import com.retailinventory.domain.repository.SupplierRepository;
import com.retailinventory.dto.PurchaseOrderCreateRequest;
import com.retailinventory.dto.PurchaseOrderUpdateRequest;
import com.retailinventory.dto.PurchaseOrderResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/purchase-orders")
@RequiredArgsConstructor
@Slf4j
@Validated
@CrossOrigin(origins = "http://localhost:3000")
public class PurchaseOrderController {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final StoreRepository storeRepository;

    @GetMapping
    public ResponseEntity<List<PurchaseOrderResponse>> getAllPurchaseOrders(
            @RequestParam(required = false) PurchaseOrder.PurchaseOrderStatus status,
            @RequestParam(required = false) UUID storeId,
            @RequestParam(required = false) UUID supplierId) {
        try {
            List<PurchaseOrder> purchaseOrders;
            
            if (storeId != null && status != null) {
                purchaseOrders = purchaseOrderRepository.findByStoreAndStatus(storeId, status);
            } else if (supplierId != null && status != null) {
                purchaseOrders = purchaseOrderRepository.findBySupplierAndStatus(supplierId, status);
            } else if (storeId != null) {
                purchaseOrders = purchaseOrderRepository.findByStoreId(storeId);
            } else if (supplierId != null) {
                purchaseOrders = purchaseOrderRepository.findBySupplierId(supplierId);
            } else if (status != null) {
                purchaseOrders = purchaseOrderRepository.findByStatus(status);
            } else {
                purchaseOrders = purchaseOrderRepository.findAll();
            }
            
            List<PurchaseOrderResponse> response = purchaseOrders.stream()
                    .map(PurchaseOrderResponse::from)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error retrieving purchase orders", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderResponse> getPurchaseOrderById(@PathVariable UUID id) {
        try {
            Optional<PurchaseOrder> purchaseOrder = purchaseOrderRepository.findById(id);
            if (purchaseOrder.isPresent()) {
                return ResponseEntity.ok(PurchaseOrderResponse.from(purchaseOrder.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error retrieving purchase order with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/po-number/{poNumber}")
    public ResponseEntity<PurchaseOrderResponse> getPurchaseOrderByPoNumber(@PathVariable String poNumber) {
        try {
            Optional<PurchaseOrder> purchaseOrder = purchaseOrderRepository.findByPoNumber(poNumber);
            if (purchaseOrder.isPresent()) {
                return ResponseEntity.ok(PurchaseOrderResponse.from(purchaseOrder.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error retrieving purchase order with PO number: {}", poNumber, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    @Transactional
    public ResponseEntity<PurchaseOrderResponse> createPurchaseOrder(@Valid @RequestBody PurchaseOrderCreateRequest request) {
        try {
            // Verify supplier and store exist
            Optional<Supplier> supplier = supplierRepository.findById(request.getSupplierId());
            if (supplier.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            Optional<Store> store = storeRepository.findById(request.getStoreId());
            if (store.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            // Auto-generate PO number if not provided
            String poNumber = request.getPoNumber();
            if (poNumber == null || poNumber.trim().isEmpty()) {
                poNumber = generatePoNumber(store.get().getCode());
            }
            
            // Check if PO number already exists
            if (purchaseOrderRepository.existsByPoNumber(poNumber)) {
                // Try alternative PO number
                poNumber = generatePoNumber(store.get().getCode());
            }

            PurchaseOrder purchaseOrder = PurchaseOrder.builder()
                    .poNumber(poNumber)
                    .supplier(supplier.get())
                    .store(store.get())
                    .status(request.getStatus())
                    .taxAmount(request.getTaxAmount())
                    .shippingAmount(request.getShippingAmount())
                    .orderDate(request.getOrderDate() != null ? request.getOrderDate() : LocalDate.now())
                    .expectedDeliveryDate(request.getExpectedDeliveryDate())
                    .createdBy(request.getCreatedBy())
                    .priority(request.getPriority())
                    .notes(request.getNotes())
                    .build();

            PurchaseOrder savedPurchaseOrder = purchaseOrderRepository.save(purchaseOrder);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(PurchaseOrderResponse.from(savedPurchaseOrder));

        } catch (Exception e) {
            log.error("Error creating purchase order", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<PurchaseOrderResponse> updatePurchaseOrder(
            @PathVariable UUID id,
            @Valid @RequestBody PurchaseOrderUpdateRequest request) {
        try {
            Optional<PurchaseOrder> existingPurchaseOrderOpt = purchaseOrderRepository.findById(id);
            if (existingPurchaseOrderOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            PurchaseOrder existingPurchaseOrder = existingPurchaseOrderOpt.get();

            // Update fields if provided
            if (request.getStatus() != null) {
                existingPurchaseOrder.setStatus(request.getStatus());
                // Set timestamps based on status change
                if (request.getStatus() == PurchaseOrder.PurchaseOrderStatus.APPROVED && request.getApprovedBy() != null) {
                    existingPurchaseOrder.setApprovedBy(request.getApprovedBy());
                    existingPurchaseOrder.setApprovedAt(LocalDateTime.now());
                }
            }
            if (request.getTaxAmount() != null) {
                existingPurchaseOrder.setTaxAmount(request.getTaxAmount());
            }
            if (request.getShippingAmount() != null) {
                existingPurchaseOrder.setShippingAmount(request.getShippingAmount());
            }
            if (request.getExpectedDeliveryDate() != null) {
                existingPurchaseOrder.setExpectedDeliveryDate(request.getExpectedDeliveryDate());
            }
            if (request.getActualDeliveryDate() != null) {
                existingPurchaseOrder.setActualDeliveryDate(request.getActualDeliveryDate());
            }
            if (request.getPriority() != null) {
                existingPurchaseOrder.setPriority(request.getPriority());
            }
            if (request.getNotes() != null) {
                existingPurchaseOrder.setNotes(request.getNotes());
            }

            PurchaseOrder updatedPurchaseOrder = purchaseOrderRepository.save(existingPurchaseOrder);
            return ResponseEntity.ok(PurchaseOrderResponse.from(updatedPurchaseOrder));

        } catch (Exception e) {
            log.error("Error updating purchase order with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PatchMapping("/{id}/status")
    @Transactional
    public ResponseEntity<PurchaseOrderResponse> updatePurchaseOrderStatus(
            @PathVariable UUID id,
            @RequestParam PurchaseOrder.PurchaseOrderStatus status,
            @RequestParam(required = false) UUID approvedBy) {
        try {
            Optional<PurchaseOrder> purchaseOrderOpt = purchaseOrderRepository.findById(id);
            if (purchaseOrderOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            PurchaseOrder purchaseOrder = purchaseOrderOpt.get();
            purchaseOrder.setStatus(status);
            
            // Set appropriate timestamps based on status
            switch (status) {
                case APPROVED:
                    if (approvedBy != null) {
                        purchaseOrder.setApprovedBy(approvedBy);
                        purchaseOrder.setApprovedAt(LocalDateTime.now());
                    }
                    break;
                case PROCESSING:
                    purchaseOrder.setSentAt(LocalDateTime.now());
                    break;
                case DELIVERED:
                    purchaseOrder.setReceivedAt(LocalDateTime.now());
                    if (purchaseOrder.getActualDeliveryDate() == null) {
                        purchaseOrder.setActualDeliveryDate(LocalDate.now());
                    }
                    break;
                case DRAFT:
                case PENDING_APPROVAL:
                case IN_TRANSIT:
                case CANCELLED:
                case REJECTED:
                    // No special handling needed for these statuses
                    break;
            }

            PurchaseOrder updatedPurchaseOrder = purchaseOrderRepository.save(purchaseOrder);
            return ResponseEntity.ok(PurchaseOrderResponse.from(updatedPurchaseOrder));

        } catch (Exception e) {
            log.error("Error updating purchase order status with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deletePurchaseOrder(@PathVariable UUID id) {
        try {
            Optional<PurchaseOrder> purchaseOrder = purchaseOrderRepository.findById(id);
            if (purchaseOrder.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            // Only allow deletion if status is DRAFT or CANCELLED
            PurchaseOrder existingPurchaseOrder = purchaseOrder.get();
            if (existingPurchaseOrder.getStatus() != PurchaseOrder.PurchaseOrderStatus.DRAFT &&
                existingPurchaseOrder.getStatus() != PurchaseOrder.PurchaseOrderStatus.CANCELLED) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }

            purchaseOrderRepository.delete(existingPurchaseOrder);
            return ResponseEntity.noContent().build();

        } catch (Exception e) {
            log.error("Error deleting purchase order with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate a unique PO number based on store code and timestamp
     */
    private String generatePoNumber(String storeCode) {
        String timestamp = String.valueOf(System.currentTimeMillis() % 100000); // Last 5 digits
        return String.format("PO-%s-%s", storeCode, timestamp);
    }
}
