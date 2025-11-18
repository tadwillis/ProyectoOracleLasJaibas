package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.model.AppUser;
import com.springboot.MyTodoList.model.TeamMember;
import com.springboot.MyTodoList.dto.SprintHoursDTO;
import com.springboot.MyTodoList.dto.SprintMemberHoursDTO;
import com.springboot.MyTodoList.repository.SprintRepository;
import com.springboot.MyTodoList.repository.TaskRepository;
import com.springboot.MyTodoList.repository.TeamMemberRepository;
import com.springboot.MyTodoList.service.SprintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/sprints")
@RequiredArgsConstructor
public class SprintController {
    
    private final SprintRepository sprintRepository;
    private final TaskRepository taskRepository;
    private final TeamMemberRepository teamMemberRepository;
    
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

    @GetMapping("/project/{projectId}/globalHours")
    public ResponseEntity<List<SprintHoursDTO>> getGlobalSprintHours(@PathVariable Long projectId) {
        return ResponseEntity.ok(sprintService.getGlobalSprintHoursByProject(projectId));
    }
    
    @GetMapping("/project/{projectId}/hours")
    public ResponseEntity<List<SprintHoursDTO>> getSprintHours(
            @PathVariable Long projectId,
            @RequestParam String username   // 👈 ahora recibimos el usuario
    ) {
        return ResponseEntity.ok(
            sprintService.getSprintHoursByProject(projectId, username)
        );
    }

    @GetMapping("/project/{projectId}/team/{teamId}/sprint-hours")
    public ResponseEntity<?> getSprintHoursByTeam(
            @PathVariable Long projectId,
            @PathVariable Long teamId
    ) {

        // 1. Obtener miembros del equipo
        List<TeamMember> members = teamMemberRepository.findByTeamId(teamId);
        List<AppUser> users = members.stream()
                .map(TeamMember::getUser)
                .toList();

        // 2. Obtener todos los sprints del proyecto
        List<Sprint> sprints = sprintRepository.findByProjectId(projectId);

        // 3. Crear estructura de respuesta
        List<String> sprintNames = sprints.stream()
                .map(Sprint::getName)
                .toList();

        List<Map<String, Object>> rows = new ArrayList<>();

        // 4. Para cada usuario → calcular horas por sprint
        for (AppUser user : users) {
            Map<String, Object> row = new HashMap<>();
            row.put("user", user.getFullName());

            List<Integer> userHours = new ArrayList<>();

            for (Sprint sprint : sprints) {
                Integer hours = taskRepository.sumHoursByUserAndSprintAndStatus(
                        user.getId(),
                        sprint.getId(),
                        "done"
                );

                userHours.add(hours != null ? hours : 0);
            }

            row.put("hours", userHours);
            rows.add(row);
        }

        // 5. Respuesta final
        Map<String, Object> response = new HashMap<>();
        response.put("sprints", sprintNames);
        response.put("rows", rows);

        return ResponseEntity.ok(response);
    }

}