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
public class ProjectService {
    
    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final AppUserRepository userRepository;
    
    public Project createProject(Project project, Long teamId, Long createdByUserId) {
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new RuntimeException("Team not found"));
        AppUser creator = userRepository.findById(createdByUserId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        project.setTeam(team);
        project.setCreatedBy(creator);
        
        return projectRepository.save(project);
    }
    
    public Optional<Project> getProjectById(Long id) {
        return projectRepository.findById(id);
    }
    
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }
    
    public List<Project> getProjectsByTeam(Long teamId) {
        return projectRepository.findByTeamId(teamId);
    }
    
    public Project updateProject(Long id, Project projectDetails) {
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Project not found"));
        
        project.setName(projectDetails.getName());
        project.setDescription(projectDetails.getDescription());
        
        return projectRepository.save(project);
    }
    
    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }
    
    public List<Project> searchProjectsByName(String name) {
        return projectRepository.searchByName(name);
    }
}