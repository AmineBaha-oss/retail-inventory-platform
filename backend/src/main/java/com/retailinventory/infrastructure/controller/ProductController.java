package com.retailinventory.infrastructure.controller;

import com.retailinventory.domain.entity.Product;
import com.retailinventory.domain.entity.Supplier;
import com.retailinventory.domain.repository.ProductRepository;
import com.retailinventory.domain.repository.SupplierRepository;
import com.retailinventory.dto.ProductCreateRequest;
import com.retailinventory.dto.ProductUpdateRequest;
import com.retailinventory.dto.ProductResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Slf4j
@Validated
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        try {
            List<Product> products = productRepository.findActiveProducts();
            List<ProductResponse> response = products.stream()
                    .map(ProductResponse::from)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error retrieving products", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable UUID id) {
        try {
            Optional<Product> product = productRepository.findById(id);
            if (product.isPresent()) {
                return ResponseEntity.ok(ProductResponse.from(product.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error retrieving product with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/sku/{sku}")
    public ResponseEntity<ProductResponse> getProductBySku(@PathVariable String sku) {
        try {
            Optional<Product> product = productRepository.findBySku(sku);
            if (product.isPresent()) {
                return ResponseEntity.ok(ProductResponse.from(product.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error retrieving product with SKU: {}", sku, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ProductResponse>> searchProducts(
            @RequestParam String query,
            Pageable pageable) {
        try {
            Page<Product> products = productRepository.searchProducts(query, pageable);
            Page<ProductResponse> response = products.map(ProductResponse::from);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error searching products with query: {}", query, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        try {
            List<String> categories = productRepository.findAllActiveCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            log.error("Error retrieving categories", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/categories/{category}/subcategories")
    public ResponseEntity<List<String>> getSubcategoriesByCategory(@PathVariable String category) {
        try {
            List<String> subcategories = productRepository.findSubcategoriesByCategory(category);
            return ResponseEntity.ok(subcategories);
        } catch (Exception e) {
            log.error("Error retrieving subcategories for category: {}", category, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/brands")
    public ResponseEntity<List<String>> getAllBrands() {
        try {
            List<String> brands = productRepository.findAllActiveBrands();
            return ResponseEntity.ok(brands);
        } catch (Exception e) {
            log.error("Error retrieving brands", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<ProductResponse>> getProductsBySupplier(@PathVariable UUID supplierId) {
        try {
            List<Product> products = productRepository.findActiveProductsBySupplier(supplierId);
            List<ProductResponse> response = products.stream()
                    .map(ProductResponse::from)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error retrieving products for supplier: {}", supplierId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductCreateRequest request) {
        try {
            // Check if SKU already exists
            if (productRepository.existsBySku(request.getSku())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }

            // Verify supplier exists
            Optional<Supplier> supplier = supplierRepository.findById(request.getSupplierId());
            if (supplier.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            Product product = Product.builder()
                    .sku(request.getSku())
                    .name(request.getName())
                    .category(request.getCategory())
                    .subcategory(request.getSubcategory())
                    .brand(request.getBrand())
                    .description(request.getDescription())
                    .unitCost(request.getUnitCost())
                    .unitPrice(request.getUnitPrice())
                    .casePackSize(request.getCasePackSize())
                    .supplier(supplier.get())
                    .status(request.getStatus())
                    .build();

            Product savedProduct = productRepository.save(product);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ProductResponse.from(savedProduct));

        } catch (Exception e) {
            log.error("Error creating product", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable UUID id,
            @Valid @RequestBody ProductUpdateRequest request) {
        try {
            Optional<Product> existingProductOpt = productRepository.findById(id);
            if (existingProductOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Product existingProduct = existingProductOpt.get();

            // Update fields if provided
            if (request.getName() != null) {
                existingProduct.setName(request.getName());
            }
            if (request.getCategory() != null) {
                existingProduct.setCategory(request.getCategory());
            }
            if (request.getSubcategory() != null) {
                existingProduct.setSubcategory(request.getSubcategory());
            }
            if (request.getBrand() != null) {
                existingProduct.setBrand(request.getBrand());
            }
            if (request.getDescription() != null) {
                existingProduct.setDescription(request.getDescription());
            }
            if (request.getUnitCost() != null) {
                existingProduct.setUnitCost(request.getUnitCost());
            }
            if (request.getUnitPrice() != null) {
                existingProduct.setUnitPrice(request.getUnitPrice());
            }
            if (request.getCasePackSize() != null) {
                existingProduct.setCasePackSize(request.getCasePackSize());
            }
            if (request.getSupplierId() != null) {
                Optional<Supplier> supplier = supplierRepository.findById(request.getSupplierId());
                if (supplier.isEmpty()) {
                    return ResponseEntity.badRequest().build();
                }
                existingProduct.setSupplier(supplier.get());
            }
            if (request.getStatus() != null) {
                existingProduct.setStatus(request.getStatus());
            }

            Product updatedProduct = productRepository.save(existingProduct);
            return ResponseEntity.ok(ProductResponse.from(updatedProduct));

        } catch (Exception e) {
            log.error("Error updating product with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteProduct(@PathVariable UUID id) {
        try {
            Optional<Product> product = productRepository.findById(id);
            if (product.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            // Soft delete by setting status to DISCONTINUED
            Product existingProduct = product.get();
            existingProduct.setStatus(Product.ProductStatus.DISCONTINUED);
            productRepository.save(existingProduct);

            return ResponseEntity.noContent().build();

        } catch (Exception e) {
            log.error("Error deleting product with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PatchMapping("/{id}/status")
    @Transactional
    public ResponseEntity<ProductResponse> updateProductStatus(
            @PathVariable UUID id,
            @RequestParam Product.ProductStatus status) {
        try {
            Optional<Product> productOpt = productRepository.findById(id);
            if (productOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Product product = productOpt.get();
            product.setStatus(status);
            Product updatedProduct = productRepository.save(product);

            return ResponseEntity.ok(ProductResponse.from(updatedProduct));

        } catch (Exception e) {
            log.error("Error updating product status with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
