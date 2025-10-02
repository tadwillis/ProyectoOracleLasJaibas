package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.AppUser;
import com.springboot.MyTodoList.model.Project;
import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.repository.AppUserRepository;
import com.springboot.MyTodoList.repository.ProjectRepository;
import com.springboot.MyTodoList.repository.SprintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class SprintService {
    
    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;
    private final AppUserRepository userRepository;
    
    public Sprint createSprint(Sprint sprint, Long projectId, Long createdByUserId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found"));
        AppUser creator = userRepository.findById(createdByUserId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        sprint.setProject(project);
        sprint.setCreatedBy(creator);
        
        return sprintRepository.save(sprint);
    }
    
    public Optional<Sprint> getSprintById(Long id) {
        return sprintRepository.findById(id);
    }
    
    public List<Sprint> getAllSprints() {
        return sprintRepository.findAll();
    }
    
    public List<Sprint> getSprintsByProject(Long projectId) {
        return sprintRepository.findByProjectId(projectId);
    }
    
    public List<Sprint> getSprintsByStatus(String status) {
        return sprintRepository.findByStatus(status);
    }
    
    public List<Sprint> getActiveSprintsByTeam(Long teamId) {
        return sprintRepository.findActiveSprintsByTeamId(teamId);
    }
    
    public Sprint updateSprint(Long id, Sprint sprintDetails) {
        Sprint sprint = sprintRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Sprint not found"));
        
        sprint.setName(sprintDetails.getName());
        sprint.setGoal(sprintDetails.getGoal());
        sprint.setStartDate(sprintDetails.getStartDate());
        sprint.setEndDate(sprintDetails.getEndDate());
        sprint.setStatus(sprintDetails.getStatus());
        
        return sprintRepository.save(sprint);
    }
    
    public Sprint updateSprintStatus(Long id, String newStatus) {
        Sprint sprint = sprintRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Sprint not found"));
        
        sprint.setStatus(newStatus);
        return sprintRepository.save(sprint);
    }
    
    public void deleteSprint(Long id) {
        sprintRepository.deleteById(id);
    }
}