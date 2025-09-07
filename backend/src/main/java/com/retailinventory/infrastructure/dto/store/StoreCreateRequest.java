package com.retailinventory.infrastructure.dto.store;

import com.retailinventory.domain.entity.Store.StoreStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

/**
 * DTO for creating a new store.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreCreateRequest {

    @NotBlank(message = "Store code is required")
    @Size(max = 50, message = "Store code must not exceed 50 characters")
    private String code;

    @NotBlank(message = "Store name is required")
    @Size(max = 255, message = "Store name must not exceed 255 characters")
    private String name;

    private String manager;

    @Email(message = "Invalid email format")
    private String email;

    @Size(max = 50, message = "Phone must not exceed 50 characters")
    private String phone;

    private String address;

    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    @Size(max = 100, message = "Country must not exceed 100 characters")
    private String country;

    @Size(max = 100, message = "Timezone must not exceed 100 characters")
    private String timezone;

    @Builder.Default
    private StoreStatus status = StoreStatus.ACTIVE;
}
