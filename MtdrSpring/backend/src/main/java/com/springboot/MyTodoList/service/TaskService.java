package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.AppUser;
import com.springboot.MyTodoList.model.Task;
import com.springboot.MyTodoList.model.Team;
import com.springboot.MyTodoList.model.UserStory;
import com.springboot.MyTodoList.repository.AppUserRepository;
import com.springboot.MyTodoList.repository.TaskRepository;
import com.springboot.MyTodoList.repository.TeamRepository;
import com.springboot.MyTodoList.repository.UserStoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {
    
    private final TaskRepository taskRepository;
    private final UserStoryRepository storyRepository;
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
    
    public Task updateTaskStatus(Long id, String newStatus) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Task not found"));
        
        task.setStatus(newStatus);
        return taskRepository.save(task);
    }
    
    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    public Map<String, Double> getKpiTotals() {
        List<Task> tasks = taskRepository.findAll();

        double totalEstimated = tasks.stream()
            .filter(t -> t.getEstimatedHours() != null)
            .mapToDouble(Task::getEstimatedHours)
            .sum();

        double totalEffort = tasks.stream()
            .filter(t -> t.getEffortHours() != null)
            .mapToDouble(Task::getEffortHours)
            .sum();

        Map<String, Double> kpi = new HashMap<>();
        kpi.put("totalEstimatedHours", totalEstimated);
        kpi.put("totalEffortHours", totalEffort);
        kpi.put("efficiency", totalEstimated == 0 ? 0 : (totalEffort / totalEstimated) * 100);

        return kpi;
    }

}