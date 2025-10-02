package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.service.SprintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sprints")
@RequiredArgsConstructor
public class SprintController {
    
    private final SprintService sprintService;
    
    @PostMapping
    public ResponseEntity<Sprint> createSprint(
            @RequestBody Sprint sprint,
            @RequestParam Long projectId,
            @RequestParam Long createdBy) {
        Sprint created = sprintService.createSprint(sprint, projectId, createdBy);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Sprint> getSprintById(@PathVariable Long id) {
        return sprintService.getSprintById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping
    public ResponseEntity<List<Sprint>> getAllSprints() {
        return ResponseEntity.ok(sprintService.getAllSprints());
    }
    
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Sprint>> getSprintsByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(sprintService.getSprintsByProject(projectId));
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Sprint>> getSprintsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(sprintService.getSprintsByStatus(status));
    }
    
    @GetMapping("/team/{teamId}/active")
    public ResponseEntity<List<Sprint>> getActiveSprintsByTeam(@PathVariable Long teamId) {
        return ResponseEntity.ok(sprintService.getActiveSprintsByTeam(teamId));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Sprint> updateSprint(@PathVariable Long id, @RequestBody Sprint sprint) {
        try {
            Sprint updated = sprintService.updateSprint(id, sprint);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PatchMapping("/{id}/status")
    public ResponseEntity<Sprint> updateSprintStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            Sprint updated = sprintService.updateSprintStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSprint(@PathVariable Long id) {
        sprintService.deleteSprint(id);
        return ResponseEntity.noContent().build();
    }
}