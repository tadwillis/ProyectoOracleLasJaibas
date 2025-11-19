package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.*;
import com.springboot.MyTodoList.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserStoryRepository storyRepository;
    private final TeamRepository teamRepository;
    private final AppUserRepository userRepository;
    private final SprintRepository sprintRepository; // 👈 agregado

    public Task createTask(Task task, Long storyId, Long teamId) {
        UserStory story = storyRepository.findById(storyId)
                .orElseThrow(() -> new RuntimeException("Story not found"));
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        task.setUserStory(story);
        task.setTeam(team);

        // 👇 Asignar sprint si viene en el JSON
        if (task.getSprint() != null && task.getSprint().getId() != null) {
            Sprint sprint = sprintRepository.findById(task.getSprint().getId())
                    .orElseThrow(() -> new RuntimeException("Sprint not found"));
            task.setSprint(sprint);
        } else {
            task.setSprint(null);
        }

        return taskRepository.save(task);
    }

    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public List<Task> getTasksByStory(Long storyId) {
        return taskRepository.findByUserStoryId(storyId);
    }

    public List<Task> getTasksBySprint(Long sprintId) {
        return taskRepository.findBySprintId(sprintId);
    }

    public List<Task> getTasksByTeam(Long teamId) {
        return taskRepository.findByTeamId(teamId);
    }

    public List<Task> getTasksByAssignedUser(Long userId) {
        return taskRepository.findByAssignedToId(userId);
    }

    public List<Task> getTasksByUserAndStatus(Long userId, String status) {
        return taskRepository.findByAssignedToIdAndStatus(userId, status);
    }

    public List<Task> getTasksByAssignedUsername(String username) {
        AppUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return taskRepository.findByAssignedToId(user.getId());
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
        task.setEstimatedHours(taskDetails.getEstimatedHours());

        // 👇 Nuevo: actualizar sprint si viene en el JSON
        if (taskDetails.getSprint() != null && taskDetails.getSprint().getId() != null) {
            Sprint sprint = sprintRepository.findById(taskDetails.getSprint().getId())
                    .orElseThrow(() -> new RuntimeException("Sprint not found"));
            task.setSprint(sprint);
        } else {
            task.setSprint(null);
        }

        // Mantener el comportamiento previo de usuario asignado
        if (taskDetails.getAssignedTo() != null) {
            task.setAssignedTo(taskDetails.getAssignedTo());
        } else {
            task.setAssignedTo(null);
        }

        return taskRepository.save(task);
    }

    public Task assignTask(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        task.setAssignedTo(user);
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

    // 👇 Métodos KPI sin cambios
    public Map<String, Double> getKpiUserHours(String username) {
        List<Task> tasks = getTasksByAssignedUsername(username);

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

    public Map<String, Integer> getKpiUserTasks(String username) {
        List<Task> tasks = getTasksByAssignedUsername(username);

        int totalPlanned = (int) Math.min(tasks.stream()
                .filter(t -> !t.getStatus().equals("cancelled"))
                .count(), Integer.MAX_VALUE);

        int totalDone = (int) Math.min(tasks.stream()
                .filter(t -> t.getStatus().equals("done"))
                .count(), Integer.MAX_VALUE);

        Map<String, Integer> kpi = new HashMap<>();
        kpi.put("totalPlannedTasks", totalPlanned);
        kpi.put("totalDoneTasks", totalDone);
        kpi.put("efficiency", totalPlanned == 0 ? 0 : (totalDone * 100) / totalPlanned);

        return kpi;
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
