package com.ramesh.backend.controller;

import com.ramesh.backend.dto.request.TaskRequest;
import com.ramesh.backend.dto.response.TaskResponse;
import com.ramesh.backend.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<TaskResponse> create(@Valid @RequestBody TaskRequest request){
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.createTask(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> complete(@PathVariable String id){
        return ResponseEntity.ok(taskService.completeTask(id));
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getMyTasks(){
        List<TaskResponse> taskResponses = taskService.getMyTasks();
        return ResponseEntity.ok(taskResponses);
    }
}
