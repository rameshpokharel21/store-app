package com.ramesh.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;


public record  UpdateProfileRequest (

    @NotBlank
    @Size(min=2, max=100, message = "Name should be between 2 and 100 chars")
    String name
){
}
