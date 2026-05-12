package com.ramesh.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;

import java.util.List;

public record ReceiveShipmentRequest(
        @NotEmpty List<ReceivedItem> receivedItems
        ) {
            public record ReceivedItem(@NotBlank String productId, @Positive int receivedQuantity) {
            }
}
