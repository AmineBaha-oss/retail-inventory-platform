package com.retailinventory.application.service;

import com.retailinventory.domain.entity.Product;
import com.retailinventory.domain.entity.Supplier;
import com.retailinventory.infrastructure.repository.ProductRepository;
import com.retailinventory.infrastructure.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('product:read')")
    public List<Product> getAllProducts() {
        return productRepository.findActiveProducts();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('product:read')")
    public Page<Product> searchProducts(String search, Pageable pageable) {
        return productRepository.searchProducts(search, pageable);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('product:read')")
    public Product getProductById(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('product:read')")
    public Product getProductBySku(String sku) {
        return productRepository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Product not found with SKU: " + sku));
    }

    @Transactional
    @PreAuthorize("hasAuthority('product:create')")
    public Product createProduct(Product product) {
        // Validate supplier exists
        if (product.getSupplier() != null) {
            supplierRepository.findById(product.getSupplier().getId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
        }

        // Check if SKU already exists
        if (productRepository.existsBySku(product.getSku())) {
            throw new RuntimeException("Product with SKU " + product.getSku() + " already exists");
        }

        log.info("Creating new product: {}", product.getSku());
        return productRepository.save(product);
    }

    @Transactional
    @PreAuthorize("hasAuthority('product:update')")
    public Product updateProduct(UUID id, Product productDetails) {
        Product product = getProductById(id);
        
        // Update fields
        if (productDetails.getName() != null) {
            product.setName(productDetails.getName());
        }
        if (productDetails.getCategory() != null) {
            product.setCategory(productDetails.getCategory());
        }
        if (productDetails.getSubcategory() != null) {
            product.setSubcategory(productDetails.getSubcategory());
        }
        if (productDetails.getBrand() != null) {
            product.setBrand(productDetails.getBrand());
        }
        if (productDetails.getDescription() != null) {
            product.setDescription(productDetails.getDescription());
        }
        if (productDetails.getUnitCost() != null) {
            product.setUnitCost(productDetails.getUnitCost());
        }
        if (productDetails.getUnitPrice() != null) {
            product.setUnitPrice(productDetails.getUnitPrice());
        }
        if (productDetails.getCasePackSize() != null) {
            product.setCasePackSize(productDetails.getCasePackSize());
        }
        if (productDetails.getSupplier() != null) {
            supplierRepository.findById(productDetails.getSupplier().getId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
            product.setSupplier(productDetails.getSupplier());
        }

        log.info("Updating product: {}", product.getSku());
        return productRepository.save(product);
    }

    @Transactional
    @PreAuthorize("hasAuthority('product:delete')")
    public void deleteProduct(UUID id) {
        Product product = getProductById(id);
        product.setStatus(Product.ProductStatus.DISCONTINUED);
        productRepository.save(product);
        log.info("Product discontinued: {}", product.getSku());
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('product:read')")
    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('product:read')")
    public List<Product> getProductsBySupplier(UUID supplierId) {
        return productRepository.findActiveProductsBySupplier(supplierId);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('product:read')")
    public List<String> getAllCategories() {
        return productRepository.findAllActiveCategories();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('product:read')")
    public List<String> getSubcategoriesByCategory(String category) {
        return productRepository.findSubcategoriesByCategory(category);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('product:read')")
    public List<String> getAllBrands() {
        return productRepository.findAllActiveBrands();
    }
}
