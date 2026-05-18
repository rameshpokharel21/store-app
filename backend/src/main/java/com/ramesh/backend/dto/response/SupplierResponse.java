package com.ramesh.backend.dto.response;

public record SupplierResponse(
        String id, String name, String contactInfo, String address, String createdAt
) {
}
