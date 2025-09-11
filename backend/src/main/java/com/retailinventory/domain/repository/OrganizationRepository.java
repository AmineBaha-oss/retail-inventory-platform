package com.retailinventory.domain.repository;

import com.retailinventory.domain.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, UUID> {

    Optional<Organization> findBySlug(String slug);

    List<Organization> findByStatus(Organization.OrganizationStatus status);

    @Query("SELECT o FROM Organization o WHERE o.name LIKE %:name%")
    List<Organization> findByNameContaining(@Param("name") String name);

    @Query("SELECT COUNT(u) FROM User u WHERE u.organization.id = :organizationId")
    long countUsersByOrganizationId(@Param("organizationId") UUID organizationId);

    @Query("SELECT o FROM Organization o WHERE o.trialEndsAt IS NOT NULL AND o.trialEndsAt < CURRENT_TIMESTAMP")
    List<Organization> findExpiredTrials();

    boolean existsBySlug(String slug);

    boolean existsByEmail(String email);
}
