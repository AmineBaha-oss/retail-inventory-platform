package com.retailinventory.infrastructure.controller;

import com.retailinventory.domain.entity.Supplier;
import com.retailinventory.domain.repository.SupplierRepository;
import com.retailinventory.infrastructure.dto.supplier.SupplierCreateRequest;
import com.retailinventory.infrastructure.dto.supplier.SupplierResponse;
import com.retailinventory.infrastructure.dto.supplier.SupplierUpdateRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Optional;
import java.util.UUID;

/**
 * REST Controller for Supplier management operations.
 */
@RestController
@RequestMapping("/suppliers")
@RequiredArgsConstructor
@Slf4j
public class SupplierController {

    private final SupplierRepository supplierRepository;

    /**
     * Get all suppliers with optional pagination and filtering.
     */
    @GetMapping
    public ResponseEntity<Page<SupplierResponse>> getAllSuppliers(Pageable pageable) {
        try {
            Page<Supplier> suppliers = supplierRepository.findAll(pageable);
            Page<SupplierResponse> response = suppliers.map(this::convertToResponse);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error retrieving suppliers", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get supplier by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<SupplierResponse> getSupplierById(@PathVariable UUID id) {
        try {
            Optional<Supplier> supplier = supplierRepository.findById(id);
            return supplier.map(s -> ResponseEntity.ok(convertToResponse(s)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error retrieving supplier with id: " + id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create a new supplier.
     */
    @PostMapping
    @Transactional
    public ResponseEntity<SupplierResponse> createSupplier(@Valid @RequestBody SupplierCreateRequest request) {
        try {
            // Check if supplier with same code already exists
            if (supplierRepository.existsByCode(request.getCode())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }

            Supplier supplier = Supplier.builder()
                    .code(request.getCode())
                    .name(request.getName())
                    .category(request.getCategory())
                    .contactPerson(request.getContactPerson())
                    .email(request.getEmail())
                    .phone(request.getPhone())
                    .country(request.getCountry())
                    .city(request.getCity())
                    .address(request.getAddress())
                    .leadTimeDays(request.getLeadTimeDays())
                    .minOrderQuantity(request.getMinOrderQuantity())
                    .minOrderValue(request.getMinOrderValue())
                    .status(request.getStatus())
                    .build();

            Supplier savedSupplier = supplierRepository.save(supplier);
            log.info("Created new supplier with id: {} and code: {}", savedSupplier.getId(), savedSupplier.getCode());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToResponse(savedSupplier));
        } catch (Exception e) {
            log.error("Error creating supplier", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update an existing supplier.
     */
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<SupplierResponse> updateSupplier(@PathVariable UUID id, 
                                                          @Valid @RequestBody SupplierUpdateRequest request) {
        try {
            Optional<Supplier> existingSupplier = supplierRepository.findById(id);
            if (existingSupplier.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Supplier supplier = existingSupplier.get();
            
            // Update fields if provided
            if (request.getName() != null) {
                supplier.setName(request.getName());
            }
            if (request.getCategory() != null) {
                supplier.setCategory(request.getCategory());
            }
            if (request.getContactPerson() != null) {
                supplier.setContactPerson(request.getContactPerson());
            }
            if (request.getEmail() != null) {
                supplier.setEmail(request.getEmail());
            }
            if (request.getPhone() != null) {
                supplier.setPhone(request.getPhone());
            }
            if (request.getCountry() != null) {
                supplier.setCountry(request.getCountry());
            }
            if (request.getCity() != null) {
                supplier.setCity(request.getCity());
            }
            if (request.getAddress() != null) {
                supplier.setAddress(request.getAddress());
            }
            if (request.getLeadTimeDays() != null) {
                supplier.setLeadTimeDays(request.getLeadTimeDays());
            }
            if (request.getMinOrderQuantity() != null) {
                supplier.setMinOrderQuantity(request.getMinOrderQuantity());
            }
            if (request.getMinOrderValue() != null) {
                supplier.setMinOrderValue(request.getMinOrderValue());
            }
            if (request.getStatus() != null) {
                supplier.setStatus(request.getStatus());
            }

            Supplier savedSupplier = supplierRepository.save(supplier);
            log.info("Updated supplier with id: {}", savedSupplier.getId());
            
            return ResponseEntity.ok(convertToResponse(savedSupplier));
        } catch (Exception e) {
            log.error("Error updating supplier with id: " + id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete a supplier.
     */
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteSupplier(@PathVariable UUID id) {
        try {
            if (!supplierRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            supplierRepository.deleteById(id);
            log.info("Deleted supplier with id: {}", id);
            
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting supplier with id: " + id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Convert Supplier entity to SupplierResponse DTO.
     */
    private SupplierResponse convertToResponse(Supplier supplier) {
        return SupplierResponse.builder()
                .id(supplier.getId())
                .code(supplier.getCode())
                .name(supplier.getName())
                .category(supplier.getCategory())
                .contactPerson(supplier.getContactPerson())
                .email(supplier.getEmail())
                .phone(supplier.getPhone())
                .country(supplier.getCountry())
                .city(supplier.getCity())
                .address(supplier.getAddress())
                .leadTimeDays(supplier.getLeadTimeDays())
                .minOrderQuantity(supplier.getMinOrderQuantity())
                .minOrderValue(supplier.getMinOrderValue())
                .status(supplier.getStatus())
                .createdAt(supplier.getCreatedAt())
                .updatedAt(supplier.getUpdatedAt())
                .build();
    }
}
