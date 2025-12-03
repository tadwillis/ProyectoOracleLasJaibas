package com.springboot.MyTodoList.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.springboot.MyTodoList.client.LLMClient; // ← NEW IMPORT
import com.springboot.MyTodoList.model.AppUser;
import com.springboot.MyTodoList.model.Task;
import com.springboot.MyTodoList.repository.TaskRepository;
import com.springboot.MyTodoList.service.TaskService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final TaskRepository taskRepository;
    private final LLMClient llmClient; // ← NEW FIELD

    @PostMapping
    public ResponseEntity<Task> createTask(
            @RequestBody Task task,
            @RequestParam Long storyId,
            @RequestParam Long teamId) {
        Task created = taskService.createTask(task, storyId, teamId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        return taskService.getTaskById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @GetMapping("/story/{storyId}")
    public ResponseEntity<List<Task>> getTasksByStory(@PathVariable Long storyId) {
        return ResponseEntity.ok(taskService.getTasksByStory(storyId));
    }

    @GetMapping("/sprint/{sprintId}")
    public ResponseEntity<List<Task>> getTasksBySprint(@PathVariable Long sprintId) {
        return ResponseEntity.ok(taskService.getTasksBySprint(sprintId));
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<Task>> getTasksByTeam(@PathVariable Long teamId) {
        return ResponseEntity.ok(taskService.getTasksByTeam(teamId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Task>> getTasksByAssignedUser(@PathVariable Long userId) {
        return ResponseEntity.ok(taskService.getTasksByAssignedUser(userId));
    }

    @GetMapping("/user/{userId}/status/{status}")
    public ResponseEntity<List<Task>> getTasksByUserAndStatus(
            @PathVariable Long userId,
            @PathVariable String status) {
        return ResponseEntity.ok(taskService.getTasksByUserAndStatus(userId, status));
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<List<Task>> getTasksByAssignedUsername(@PathVariable String username) {
        return ResponseEntity.ok(taskService.getTasksByAssignedUsername(username));
    }

    @GetMapping("/kpi/hours")
    public ResponseEntity<Map<String, Double>> getKpiHours() {
        return ResponseEntity.ok(taskService.getKpiTotals());
    }

    @GetMapping("/kpiUser/hours/{username}")
    public ResponseEntity<Map<String, Double>> getKpiUserHours(@PathVariable String username) {
        return ResponseEntity.ok(taskService.getKpiUserHours(username));
    }

    @GetMapping("/kpiUser/tasks/{username}")
    public ResponseEntity<Map<String, Integer>> getKpiUserTasks(@PathVariable String username) {
        return ResponseEntity.ok(taskService.getKpiUserTasks(username));
    }

    @GetMapping("/kpiTeam/sprint/{sprintId}")
    public ResponseEntity<?> getTasksBySprintWithUser(@PathVariable Long sprintId) {
        List<Task> tasks = taskRepository.findBySprintIdAndStatus(sprintId, "done");

        List<Map<String, String>> rows = new ArrayList<>();

        for (Task task : tasks) {
            Map<String, String> row = new HashMap<>();

            AppUser user = task.getAssignedTo();

            if (user != null) {
                row.put("user", user.getFullName());
            } else {
                row.put("user", "-");
            }
            row.put("task", task.getTitle());
            rows.add(row);
        }

        return ResponseEntity.ok(rows);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody Task task) {
        try {
            Task updated = taskService.updateTask(id, task);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<Task> assignTask(
            @PathVariable Long id,
            @RequestParam Long userId) {
        try {
            Task updated = taskService.assignTask(id, userId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Task> updateTaskStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            Task updated = taskService.updateTaskStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * NEW ENDPOINT: Analyze a task with AI
     */
    @GetMapping("/{id}/analyze")
    public ResponseEntity<LLMClient.TaskAnalysisResponse> analyzeTask(@PathVariable Long id) {
        // Get task from database
        Task task = taskService.getTaskById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        // Call Python service
        LLMClient.TaskAnalysisResponse analysis = llmClient.analyzeTask(
                task.getTitle(),
                task.getDescription(),
                task.getEstimatedHours(),
                task.getPriority());

        return ResponseEntity.ok(analysis);
    }
}