package com.retailinventory.infrastructure.repository;

import com.retailinventory.domain.entity.Store;
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
public interface StoreRepository extends JpaRepository<Store, UUID> {

    Optional<Store> findByCode(String code);
    
    boolean existsByCode(String code);
    
    List<Store> findByStatus(Store.StoreStatus status);
    
    List<Store> findByCountry(String country);
    
    List<Store> findByCity(String city);
    
    List<Store> findByManager(String manager);
    
    @Query("SELECT s FROM Store s WHERE s.status = 'ACTIVE'")
    List<Store> findActiveStores();
    
    @Query("SELECT s FROM Store s WHERE s.status = 'ACTIVE' AND " +
           "(LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.code) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.city) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.manager) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Store> searchStores(@Param("search") String search, Pageable pageable);
    
    @Query("SELECT DISTINCT s.country FROM Store s WHERE s.status = 'ACTIVE' ORDER BY s.country")
    List<String> findAllActiveCountries();
    
    @Query("SELECT DISTINCT s.city FROM Store s WHERE s.country = :country AND s.status = 'ACTIVE' ORDER BY s.city")
    List<String> findCitiesByCountry(@Param("country") String country);
    
    @Query("SELECT COUNT(s) FROM Store s WHERE s.status = 'ACTIVE'")
    Long countActiveStores();
    
    @Query("SELECT s FROM Store s JOIN s.authorizedUsers u WHERE u.id = :userId")
    List<Store> findStoresAccessibleByUser(@Param("userId") UUID userId);
    
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM Store s " +
           "JOIN s.authorizedUsers u WHERE s.id = :storeId AND u.id = :userId")
    boolean isStoreAccessibleByUser(@Param("storeId") UUID storeId, @Param("userId") UUID userId);
}
