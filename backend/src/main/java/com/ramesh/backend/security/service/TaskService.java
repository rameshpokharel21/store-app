package com.ramesh.backend.security.service;

import com.ramesh.backend.dto.request.TaskRequest;
import com.ramesh.backend.dto.response.TaskResponse;
import com.ramesh.backend.dto.response.UserResponse;
import com.ramesh.backend.entity.Role;
import com.ramesh.backend.entity.Task;
import com.ramesh.backend.entity.TaskStatus;
import com.ramesh.backend.entity.User;
import com.ramesh.backend.exception.ResourceNotFoundException;
import com.ramesh.backend.exception.UnauthorizedException;
import com.ramesh.backend.repository.TaskRepository;
import com.ramesh.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public TaskResponse createTask(TaskRequest request){
        User assignedBy = userService.getUser();
        User assignedTo = userRepository.findById(request.assignedToId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.assignedToId()));

        Task task = new Task();
        task.setAssignedBy(assignedBy);
        task.setAssignedTo(assignedTo);
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setDueDate(request.dueDate());
        task.setStatus(TaskStatus.PENDING);

        Task saved = taskRepository.save(task);
        return toResponse(saved);
    }

    //complete task
    public TaskResponse completeTask(String taskId){
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
        User currentUser = userService.getUser();
        if(!task.getAssignedTo().getId().equals(currentUser.getId())){
            throw  new UnauthorizedException("You can only complete task assigned to you");
        }
        task.setStatus(TaskStatus.COMPLETED);
        Task saved = taskRepository.save(task);
        return toResponse(saved);
    }

    //GET
    public List<TaskResponse> getMyTasks(){
        User currentUser = userService.getUser();
        return taskRepository.findByAssignedToId(currentUser.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    //GET by ID
    public TaskResponse getTaskById(String taskId){
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
        return toResponse(task);
    }

    //UPDATE if needed
    public TaskResponse updateTask(String taskId, TaskRequest request){
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        //only manager who created or admin can update
        User currentUser = userService.getUser();
        if(!task.getAssignedBy().getId().equals(currentUser.getId()) &&
         !currentUser.getRoles().contains(Role.ADMIN)){
            throw new UnauthorizedException("Only the task creator or admin can update this task");
        }
        User newAssignee = userRepository.findById(request.assignedToId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.assignedToId()));

        task.setAssignedTo(newAssignee);
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setDueDate(request.dueDate());
        //don't change status via update
        //don't change assignedBy
        Task saved = taskRepository.save(task);
        return toResponse(saved);
    }

    //DELETE
    public void deleteTask(String taskId){
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
        taskRepository.delete(task);
    }
    private TaskResponse toResponse(Task task){

        //map user to UserResponse
        UserResponse assignedByResponse = userService.toUserResponse(task.getAssignedBy());
        UserResponse assignedToResponse = userService.toUserResponse(task.getAssignedTo());

        return new TaskResponse(
            task.getId(),
                task.getTitle(),
                task.getDescription(),
                assignedByResponse,
                assignedToResponse,
                task.getStatus(),
                task.getDueDate(),
                task.getCreatedAt().toString()
        );
    }
}
