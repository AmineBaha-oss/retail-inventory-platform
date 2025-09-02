package com.retailinventory.infrastructure.repository;

import com.retailinventory.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    @Query("SELECT u FROM User u WHERE u.status = 'ACTIVE' AND u.emailVerified = true")
    List<User> findActiveUsers();
    
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName")
    List<User> findByRoleName(@Param("roleName") String roleName);
    
    @Query("SELECT u FROM User u JOIN u.accessibleStores s WHERE s.id = :storeId")
    List<User> findByAccessibleStore(@Param("storeId") UUID storeId);
    
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u " +
           "JOIN u.accessibleStores s WHERE u.id = :userId AND s.id = :storeId")
    boolean hasStoreAccess(@Param("userId") UUID userId, @Param("storeId") UUID storeId);
    
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u " +
           "JOIN u.roles r JOIN r.permissions p WHERE u.id = :userId AND p.name = :permissionName")
    boolean hasPermission(@Param("userId") UUID userId, @Param("permissionName") String permissionName);
}
