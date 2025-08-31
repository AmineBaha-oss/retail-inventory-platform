package com.retailinventory.domain.repository;

import com.retailinventory.domain.entity.Store;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Store entity.
 * Provides data access methods for store management and analytics.
 */
@Repository
public interface StoreRepository extends JpaRepository<Store, Long>, JpaSpecificationExecutor<Store> {

    // Basic CRUD operations
    Optional<Store> findByCode(String code);
    Optional<Store> findByCodeAndDeletedFalse(String code);
    boolean existsByCode(String code);
    
    // Find by status and type
    List<Store> findByStatus(Store.StoreStatus status);
    List<Store> findByType(Store.StoreType type);
    List<Store> findByStatusAndType(Store.StoreStatus status, Store.StoreType type);
    
    // Find by POS system
    List<Store> findByPosSystem(Store.POSSystem posSystem);
    
    // Find by sync frequency
    List<Store> findBySyncFrequency(Store.SyncFrequency syncFrequency);
    
    // Find stores that need attention (high stockout rates)
    @Query("SELECT s FROM Store s WHERE s.stockoutRate > :threshold AND s.deleted = false")
    List<Store> findStoresNeedingAttention(@Param("threshold") BigDecimal threshold);
    
    // Find high-performance stores
    @Query("SELECT s FROM Store s WHERE s.serviceLevel >= :minServiceLevel AND s.deleted = false")
    List<Store> findHighPerformanceStores(@Param("minServiceLevel") BigDecimal minServiceLevel);
    
    // Find stores by location
    List<Store> findByCity(String city);
    List<Store> findByCountry(String country);
    List<Store> findByCityAndCountry(String city, String country);
    
    // Find stores by manager
    List<Store> findByManagerContainingIgnoreCase(String manager);
    
    // Find stores that haven't synced recently
    @Query("SELECT s FROM Store s WHERE s.lastSync < :cutoffDate AND s.deleted = false")
    List<Store> findStoresNeedingSync(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    // Find stores that haven't updated forecasts recently
    @Query("SELECT s FROM Store s WHERE s.lastForecastUpdate < :cutoffDate AND s.deleted = false")
    List<Store> findStoresNeedingForecastUpdate(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    // Analytics queries
    @Query("SELECT AVG(s.serviceLevel) FROM Store s WHERE s.deleted = false")
    Optional<BigDecimal> getAverageServiceLevel();
    
    @Query("SELECT AVG(s.stockoutRate) FROM Store s WHERE s.deleted = false")
    Optional<BigDecimal> getAverageStockoutRate();
    
    @Query("SELECT AVG(s.turnoverRate) FROM Store s WHERE s.deleted = false")
    Optional<BigDecimal> getAverageTurnoverRate();
    
    @Query("SELECT SUM(s.monthlyRevenue) FROM Store s WHERE s.deleted = false")
    Optional<BigDecimal> getTotalMonthlyRevenue();
    
    @Query("SELECT COUNT(s) FROM Store s WHERE s.status = :status AND s.deleted = false")
    long countByStatus(@Param("status") Store.StoreStatus status);
    
    @Query("SELECT COUNT(s) FROM Store s WHERE s.type = :type AND s.deleted = false")
    long countByType(@Param("type") Store.StoreType type);
    
    // Search functionality
    @Query("SELECT s FROM Store s WHERE " +
           "(LOWER(s.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(s.code) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(s.manager) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(s.city) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "s.deleted = false")
    Page<Store> searchStores(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    // Performance-based queries
    @Query("SELECT s FROM Store s WHERE s.stockoutRate > :maxStockoutRate AND s.deleted = false ORDER BY s.stockoutRate DESC")
    List<Store> findStoresWithHighStockoutRate(@Param("maxStockoutRate") BigDecimal maxStockoutRate);
    
    @Query("SELECT s FROM Store s WHERE s.serviceLevel < :minServiceLevel AND s.deleted = false ORDER BY s.serviceLevel ASC")
    List<Store> findStoresWithLowServiceLevel(@Param("minServiceLevel") BigDecimal minServiceLevel);
    
    // Find stores by revenue range
    @Query("SELECT s FROM Store s WHERE s.monthlyRevenue BETWEEN :minRevenue AND :maxRevenue AND s.deleted = false")
    List<Store> findStoresByRevenueRange(@Param("minRevenue") BigDecimal minRevenue, @Param("maxRevenue") BigDecimal maxRevenue);
    
    // Find stores by lead time
    @Query("SELECT s FROM Store s WHERE s.avgLeadTime > :maxLeadTime AND s.deleted = false ORDER BY s.avgLeadTime DESC")
    List<Store> findStoresWithLongLeadTime(@Param("maxLeadTime") Integer maxLeadTime);
    
    // Custom finder for dashboard
    @Query("SELECT s FROM Store s WHERE s.deleted = false ORDER BY s.createdAt DESC")
    Page<Store> findRecentStores(Pageable pageable);
    
    // Find stores by multiple criteria for advanced filtering
    @Query("SELECT s FROM Store s WHERE " +
           "(:status IS NULL OR s.status = :status) AND " +
           "(:type IS NULL OR s.type = :type) AND " +
           "(:posSystem IS NULL OR s.posSystem = :posSystem) AND " +
           "(:minServiceLevel IS NULL OR s.serviceLevel >= :minServiceLevel) AND " +
           "(:maxStockoutRate IS NULL OR s.stockoutRate <= :maxStockoutRate) AND " +
           "s.deleted = false")
    Page<Store> findStoresByMultipleCriteria(
        @Param("status") Store.StoreStatus status,
        @Param("type") Store.StoreType type,
        @Param("posSystem") Store.POSSystem posSystem,
        @Param("minServiceLevel") BigDecimal minServiceLevel,
        @Param("maxStockoutRate") BigDecimal maxStockoutRate,
        Pageable pageable
    );
}
