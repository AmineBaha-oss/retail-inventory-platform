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

    List<Forecast> findByStoreId(UUID storeId);
    
    List<Forecast> findByProductId(UUID productId);
    
    List<Forecast> findByStoreIdAndProductId(UUID storeId, UUID productId);
    
    Optional<Forecast> findTopByStoreIdAndProductIdOrderByForecastDateDesc(UUID storeId, UUID productId);
    
    List<Forecast> findByStoreIdAndProductIdAndForecastDateBetween(
        UUID storeId, UUID productId, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT f FROM Forecast f WHERE f.storeId = :storeId AND f.forecastDate >= :date")
    List<Forecast> findFutureForecastsByStore(@Param("storeId") UUID storeId, @Param("date") LocalDate date);
    
    @Query("SELECT f FROM Forecast f WHERE f.productId = :productId AND f.forecastDate >= :date")
    List<Forecast> findFutureForecastsByProduct(@Param("productId") UUID productId, @Param("date") LocalDate date);
}
