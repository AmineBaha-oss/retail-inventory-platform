package com.retailinventory.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "organizations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"users", "stores"})
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "slug", unique = true, nullable = false, length = 100)
    private String slug;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "website", length = 255)
    private String website;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "email", length = 255)
    private String email;

    @Embedded
    private Address address;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    @Builder.Default
    private OrganizationStatus status = OrganizationStatus.ACTIVE;

    @Column(name = "subscription_plan", length = 50)
    private String subscriptionPlan;

    @Column(name = "max_users")
    private Integer maxUsers;

    @Column(name = "trial_ends_at")
    private LocalDateTime trialEndsAt;

    @OneToMany(mappedBy = "organization", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Builder.Default
    private Set<User> users = new HashSet<>();

    @OneToMany(mappedBy = "organization", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Builder.Default
    private Set<Store> stores = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Helper methods
    public void addUser(User user) {
        users.add(user);
        user.setOrganization(this);
    }

    public void removeUser(User user) {
        users.remove(user);
        user.setOrganization(null);
    }

    public void addStore(Store store) {
        stores.add(store);
        store.setOrganization(this);
    }

    public void removeStore(Store store) {
        stores.remove(store);
        store.setOrganization(null);
    }

    public boolean isTrialActive() {
        return trialEndsAt != null && trialEndsAt.isAfter(LocalDateTime.now());
    }

    public boolean hasReachedUserLimit() {
        if (maxUsers == null) {
            return false;
        }
        return users.size() >= maxUsers;
    }

    public enum OrganizationStatus {
        ACTIVE,
        INACTIVE,
        SUSPENDED,
        TRIAL
    }

    @Embeddable
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Address {
        @Column(name = "address_line1", length = 255)
        private String addressLine1;

        @Column(name = "address_line2", length = 255)
        private String addressLine2;

        @Column(name = "city", length = 100)
        private String city;

        @Column(name = "state", length = 100)
        private String state;

        @Column(name = "postal_code", length = 20)
        private String postalCode;

        @Column(name = "country", length = 100)
        private String country;

        public String getFullAddress() {
            StringBuilder sb = new StringBuilder();
            if (addressLine1 != null) sb.append(addressLine1);
            if (addressLine2 != null) sb.append(", ").append(addressLine2);
            if (city != null) sb.append(", ").append(city);
            if (state != null) sb.append(", ").append(state);
            if (postalCode != null) sb.append(" ").append(postalCode);
            if (country != null) sb.append(", ").append(country);
            return sb.toString();
        }
    }
}
