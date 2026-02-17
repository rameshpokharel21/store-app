package com.ramesh.backend.dto.request;

import com.ramesh.backend.validation.PasswordMatch;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;


@PasswordMatch
public record RegisterRequest (

    @NotBlank(message = "Name is required")
    @Size(min=2, max=100, message = "Name must be between 2 and 100 characters")
    String name,

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    String email,

    @NotBlank(message = "Password is required")
    @Size(min=6, max=40, message = "Password must be between 8 and 40 characters")
    String password,

    @NotBlank(message = "Confirm password is required")
    String confirmPassword
        ){
}
