package com.retailinventory.infrastructure.dto.store;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.retailinventory.domain.entity.Store.StoreStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for store responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreResponse {

    private UUID id;
    private String code;
    private String name;
    private String manager;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String country;
    private String timezone;
    private StoreStatus status;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
}
