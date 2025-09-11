package com.retailinventory.domain.repository;

import com.retailinventory.domain.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, UUID> {

    Optional<Permission> findByName(String name);
    
    boolean existsByName(String name);
    
    List<Permission> findByNameIn(Set<String> names);
    
    List<Permission> findByResource(String resource);
    
    List<Permission> findByAction(String action);
}
