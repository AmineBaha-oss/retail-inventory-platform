package com.retailinventory.domain.repository;

import com.retailinventory.domain.entity.Forecast;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ForecastRepository extends JpaRepository<Forecast, UUID> {

    @Query("SELECT f FROM Forecast f WHERE f.store.id = :storeId")
    List<Forecast> findByStoreId(@Param("storeId") UUID storeId);
    
    @Query("SELECT f FROM Forecast f WHERE f.product.id = :productId")
    List<Forecast> findByProductId(@Param("productId") UUID productId);
    
    @Query("SELECT f FROM Forecast f WHERE f.store.id = :storeId AND f.product.id = :productId")
    List<Forecast> findByStoreIdAndProductId(@Param("storeId") UUID storeId, @Param("productId") UUID productId);
    
    @Query("SELECT f FROM Forecast f WHERE f.store.id = :storeId AND f.product.id = :productId ORDER BY f.forecastDate DESC")
    Optional<Forecast> findTopByStoreIdAndProductIdOrderByForecastDateDesc(@Param("storeId") UUID storeId, @Param("productId") UUID productId);
    
    @Query("SELECT f FROM Forecast f WHERE f.store.id = :storeId AND f.product.id = :productId AND f.forecastDate BETWEEN :startDate AND :endDate")
    List<Forecast> findByStoreIdAndProductIdAndForecastDateBetween(
        @Param("storeId") UUID storeId, @Param("productId") UUID productId, 
        @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT f FROM Forecast f WHERE f.store.id = :storeId AND f.forecastDate >= :date")
    List<Forecast> findFutureForecastsByStore(@Param("storeId") UUID storeId, @Param("date") LocalDate date);
    
    @Query("SELECT f FROM Forecast f WHERE f.product.id = :productId AND f.forecastDate >= :date")
    List<Forecast> findFutureForecastsByProduct(@Param("productId") UUID productId, @Param("date") LocalDate date);
}
