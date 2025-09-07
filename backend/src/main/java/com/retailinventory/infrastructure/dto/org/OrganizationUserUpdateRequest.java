package com.retailinventory.infrastructure.dto.org;

import com.retailinventory.domain.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

@Data
public class OrganizationUserUpdateRequest {

    @Email(message = "Invalid email format")
    private String email;

    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    private String firstName;
    private String lastName;
    private String phone;
    private Set<String> roles;
    private User.UserStatus status;
}
