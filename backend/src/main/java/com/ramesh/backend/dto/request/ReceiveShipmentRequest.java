package com.ramesh.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record ReceiveShipmentRequest(
        @NotEmpty List<ReceivedItem> receivedItems
        ) {
            public record ReceivedItem(@NotBlank String productId, @Min(1) int receivedQuantity) {
            }
}
