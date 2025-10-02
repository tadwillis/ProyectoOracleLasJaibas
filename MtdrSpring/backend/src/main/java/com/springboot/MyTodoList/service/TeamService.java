package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.AppUser;
import com.springboot.MyTodoList.model.Team;
import com.springboot.MyTodoList.model.TeamMember;
import com.springboot.MyTodoList.repository.AppUserRepository;
import com.springboot.MyTodoList.repository.TeamMemberRepository;
import com.springboot.MyTodoList.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class TeamService {
    
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final AppUserRepository userRepository;
    
    public Team createTeam(Team team, Long createdByUserId) {
        AppUser creator = userRepository.findById(createdByUserId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        team.setCreatedBy(creator);
        Team savedTeam = teamRepository.save(team);
        
        // Agregar al creador como owner del equipo
        TeamMember ownerMember = TeamMember.builder()
            .team(savedTeam)
            .user(creator)
            .role("owner")
            .build();
        teamMemberRepository.save(ownerMember);
        
        return savedTeam;
    }
    
    public Optional<Team> getTeamById(Long id) {
        return teamRepository.findById(id);
    }
    
    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }
    
    public List<Team> getTeamsByUser(Long userId) {
        return teamRepository.findTeamsByUserId(userId);
    }
    
    public Team updateTeam(Long id, Team teamDetails) {
        Team team = teamRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Team not found"));
        
        team.setName(teamDetails.getName());
        team.setDescription(teamDetails.getDescription());
        
        return teamRepository.save(team);
    }
    
    public void deleteTeam(Long id) {
        teamRepository.deleteById(id);
    }
    
    public List<Team> searchTeamsByName(String name) {
        return teamRepository.searchByName(name);
    }
}