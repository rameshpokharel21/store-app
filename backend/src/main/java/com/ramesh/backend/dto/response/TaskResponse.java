package com.ramesh.backend.dto.response;

import com.ramesh.backend.entity.TaskStatus;

import java.time.LocalDateTime;

public record TaskResponse(
        String id, String title, String description, UserResponse assignedBy,
        UserResponse assignedTo, TaskStatus status, LocalDateTime dueDate, String createdAt
) {
}
