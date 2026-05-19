package com.ramesh.backend.repository;

import com.ramesh.backend.entity.Task;
import com.ramesh.backend.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, String> {

    List<Task> findByAssignedToIdAndStatus(Long userId, TaskStatus status);
    List<Task> findByAssignedToId(Long userId);
    long countByStatus(TaskStatus status);
}
