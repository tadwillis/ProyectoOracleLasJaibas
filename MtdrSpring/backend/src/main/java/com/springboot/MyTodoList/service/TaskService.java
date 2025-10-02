package com.tuapp.projectmanagement.service;

import com.tuapp.projectmanagement.model.*;
import com.tuapp.projectmanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {
    
    private final TaskRepository taskRepository;
    private final UserStoryRepository storyRepository;
    private final SprintRepository sprintRepository;
    private final TeamRepository teamRepository;
    private final AppUserRepository userRepository;
    
    public Task createTask(Task task, Long storyId, Long teamId) {
        UserStory story = storyRepository.findById(storyId)
            .orElseThrow(() -> new RuntimeException("Story not found"));
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new RuntimeException("Team not found"));
        
        task.setStory(story);
        task.setTeam(team);
        
        return taskRepository.save(task);
    }
    
    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }
    
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }
    
    public List<Task> getTasksByStory(Long storyId) {
        return taskRepository.findByStoryId(storyId);
    }
    
    public List<Task> getTasksBySprint(Long sprintId) {
        return taskRepository.findBySprintId(sprintId);
    }
    
    public List<Task> getTasksByTeam(Long teamId) {
        return taskRepository.findByTeamId(teamId);
    }
    
    public List<Task> getTasksByAssignedUser(Long userId) {
        return taskRepository.findByAssignedUserId(userId);
    }
    
    public List<Task> getTasksByUserAndStatus(Long userId, String status) {
        return taskRepository.findByAssignedUserIdAndStatus(userId, status);
    }
    
    public Task updateTask(Long id, Task taskDetails) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Task not found"));
        
        task.setTitle(taskDetails.getTitle());
        task.setDescription(taskDetails.getDescription());
        task.setStatus(taskDetails.getStatus());
        task.setEffortHours(taskDetails.getEffortHours());
        task.setPriority(taskDetails.getPriority());
        task.setStartDate(taskDetails.getStartDate());
        task.setEndDate(taskDetails.getEndDate());
        
        return taskRepository.save(task);
    }
    
    public Task assignTask(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Task not found"));
        AppUser user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        task.setAssignedUser(user);
        return taskRepository.save(task);
    }
    
    public Task assignTaskToSprint(Long taskId, Long sprintId) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Task not found"));
        Sprint sprint = sprintRepository.findById(sprintId)
            .orElseThrow(() -> new RuntimeException("Sprint not found"));
        
        task.setSprint(sprint);
        return taskRepository.save(task);
    }
    
    public Task updateTaskStatus(Long id, String newStatus) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Task not found"));
        
        task.setStatus(newStatus);
        return taskRepository.save(task);
    }
    
    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }
    
    public List<Task> searchTasksByTitle(String keyword) {
        return taskRepository.searchByTitle(keyword);
    }
    
    public Double getSprintProgress(Long sprintId) {
        Long total = taskRepository.countTotalTasksBySprintId(sprintId);
        if (total == 0) return 0.0;
        
        Long completed = taskRepository.countCompletedTasksBySprintId(sprintId);
        return (completed * 100.0) / total;
    }
}