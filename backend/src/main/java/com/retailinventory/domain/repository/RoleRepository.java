package com.retailinventory.domain.repository;

import com.retailinventory.domain.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {

    Optional<Role> findByName(String name);
    
    boolean existsByName(String name);
    
    List<Role> findByNameIn(Set<String> names);
    
    List<Role> findByIsSystemRole(Boolean isSystemRole);
}
