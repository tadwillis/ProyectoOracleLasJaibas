package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.TeamMember;
import com.springboot.MyTodoList.service.TeamMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/team-members")
@RequiredArgsConstructor
public class TeamMemberController {
    
    private final TeamMemberService teamMemberService;
    
    @PostMapping
    public ResponseEntity<TeamMember> addMember(
            @RequestParam Long teamId,
            @RequestParam Long userId,
            @RequestParam String role) {
        try {
            TeamMember member = teamMemberService.addMemberToTeam(teamId, userId, role);
            return ResponseEntity.status(HttpStatus.CREATED).body(member);
        } catch (IllegalArgumentException | RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<TeamMember>> getTeamMembers(@PathVariable Long teamId) {
        return ResponseEntity.ok(teamMemberService.getTeamMembers(teamId));
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TeamMember>> getUserTeamMemberships(@PathVariable Long userId) {
        return ResponseEntity.ok(teamMemberService.getUserTeamMemberships(userId));
    }
    
    @PatchMapping
    public ResponseEntity<TeamMember> updateMemberRole(
            @RequestParam Long teamId,
            @RequestParam Long userId,
            @RequestParam String role) {
        try {
            TeamMember updated = teamMemberService.updateMemberRole(teamId, userId, role);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping
    public ResponseEntity<Void> removeMember(
            @RequestParam Long teamId,
            @RequestParam Long userId) {
        try {
            teamMemberService.removeMemberFromTeam(teamId, userId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}