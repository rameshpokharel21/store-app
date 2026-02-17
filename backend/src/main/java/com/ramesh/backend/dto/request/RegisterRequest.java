package com.ramesh.backend.dto.request;

import com.ramesh.backend.validation.PasswordMatch;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@PasswordMatch
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    @Size(min=2, max=100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min=6, max=40, message = "Password must be between 8 and 40 characters")
    private String password;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;
}
