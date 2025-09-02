package com.retailinventory.domain.repository;

import com.retailinventory.domain.entity.Supplier;
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
public interface SupplierRepository extends JpaRepository<Supplier, UUID> {

    Optional<Supplier> findByCode(String code);
    
    boolean existsByCode(String code);
    
    List<Supplier> findByStatus(Supplier.SupplierStatus status);
    
    List<Supplier> findByCategory(String category);
    
    List<Supplier> findByCountry(String country);
    
    List<Supplier> findByCity(String city);
    
    @Query("SELECT s FROM Supplier s WHERE s.status = 'ACTIVE'")
    List<Supplier> findActiveSuppliers();
    
    @Query("SELECT s FROM Supplier s WHERE s.status = 'ACTIVE' AND " +
           "(LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.code) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.category) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Supplier> searchSuppliers(@Param("search") String search, Pageable pageable);
    
    @Query("SELECT s FROM Supplier s WHERE s.status = 'ACTIVE' AND s.category = :category")
    List<Supplier> findActiveSuppliersByCategory(@Param("category") String category);
    
    @Query("SELECT DISTINCT s.category FROM Supplier s WHERE s.status = 'ACTIVE' ORDER BY s.category")
    List<String> findAllActiveCategories();
    
    @Query("SELECT DISTINCT s.country FROM Supplier s WHERE s.status = 'ACTIVE' ORDER BY s.country")
    List<String> findAllActiveCountries();
    
    @Query("SELECT s FROM Supplier s WHERE s.status = 'ACTIVE' AND s.leadTimeDays <= :maxLeadTime")
    List<Supplier> findByMaxLeadTime(@Param("maxLeadTime") Integer maxLeadTime);
    
    @Query("SELECT s FROM Supplier s WHERE s.status = 'ACTIVE' AND s.minOrderValue <= :budget")
    List<Supplier> findByMaxBudget(@Param("budget") Double budget);
    
    @Query("SELECT AVG(s.leadTimeDays) FROM Supplier s WHERE s.status = 'ACTIVE'")
    Double calculateAverageLeadTime();
    
    @Query("SELECT COUNT(s) FROM Supplier s WHERE s.status = 'ACTIVE'")
    Long countActiveSuppliers();
}
