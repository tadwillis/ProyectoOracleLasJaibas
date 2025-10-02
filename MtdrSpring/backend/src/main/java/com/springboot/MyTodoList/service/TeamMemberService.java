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

@Service
@RequiredArgsConstructor
@Transactional
public class TeamMemberService {
    
    private final TeamMemberRepository teamMemberRepository;
    private final TeamRepository teamRepository;
    private final AppUserRepository userRepository;
    
    public TeamMember addMemberToTeam(Long teamId, Long userId, String role) {
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new RuntimeException("Team not found"));
        AppUser user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (teamMemberRepository.existsByTeamAndUser(team, user)) {
            throw new IllegalArgumentException("User is already a member of this team");
        }
        
        TeamMember member = TeamMember.builder()
            .team(team)
            .user(user)
            .role(role)
            .build();
        
        return teamMemberRepository.save(member);
    }
    
    public List<TeamMember> getTeamMembers(Long teamId) {
        return teamMemberRepository.findByTeamId(teamId);
    }
    
    public List<TeamMember> getUserTeamMemberships(Long userId) {
        AppUser user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return teamMemberRepository.findByUser(user);
    }
    
    public TeamMember updateMemberRole(Long teamId, Long userId, String newRole) {
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new RuntimeException("Team not found"));
        AppUser user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        TeamMember member = teamMemberRepository.findByTeamAndUser(team, user)
            .orElseThrow(() -> new RuntimeException("Member not found in this team"));
        
        member.setRole(newRole);
        return teamMemberRepository.save(member);
    }
    
    public void removeMemberFromTeam(Long teamId, Long userId) {
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new RuntimeException("Team not found"));
        AppUser user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        teamMemberRepository.deleteByTeamAndUser(team, user);
    }
}