package com.retailinventory.domain.repository;

import com.retailinventory.domain.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    Optional<Product> findBySku(String sku);
    
    boolean existsBySku(String sku);
    
    List<Product> findByStatus(Product.ProductStatus status);
    
    List<Product> findByCategory(String category);
    
    List<Product> findByCategoryAndSubcategory(String category, String subcategory);
    
    List<Product> findByBrand(String brand);
    
    List<Product> findBySupplierId(UUID supplierId);
    
    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE'")
    List<Product> findActiveProducts();
    
    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.category) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.brand) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> searchProducts(@Param("search") String search, Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.supplier.id = :supplierId AND p.status = 'ACTIVE'")
    List<Product> findActiveProductsBySupplier(@Param("supplierId") UUID supplierId);
    
    @Query("SELECT DISTINCT p.category FROM Product p WHERE p.status = 'ACTIVE' ORDER BY p.category")
    List<String> findAllActiveCategories();
    
    @Query("SELECT DISTINCT p.subcategory FROM Product p WHERE p.category = :category AND p.status = 'ACTIVE' ORDER BY p.subcategory")
    List<String> findSubcategoriesByCategory(@Param("category") String category);
    
    @Query("SELECT DISTINCT p.brand FROM Product p WHERE p.status = 'ACTIVE' ORDER BY p.brand")
    List<String> findAllActiveBrands();
}
