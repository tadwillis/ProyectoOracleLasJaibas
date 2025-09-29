package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.entity.TeamMember;
import com.springboot.MyTodoList.entity.Team;
import com.springboot.MyTodoList.entity.AppUser;
import com.springboot.MyTodoList.model.TeamMemberDTO;
import com.springboot.MyTodoList.repository.TeamMemberRepository;
import com.springboot.MyTodoList.repository.TeamRepository;
import com.springboot.MyTodoList.repository.AppUserRepository;

import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


import java.time.LocalDateTime;
import java.util.Optional;


@Service
public class TeamMemberService {

    private final TeamMemberRepository repo;
    private final TeamRepository teamRepo;
    private final AppUserRepository userRepo;

    public TeamMemberService(TeamMemberRepository repo,
                             TeamRepository teamRepo,
                             AppUserRepository userRepo) {
        this.repo = repo;
        this.teamRepo = teamRepo;
        this.userRepo = userRepo;
    }

 
    public Page<TeamMemberDTO> findAll(Pageable pageable) {
        return repo.findAll(pageable).map(this::toDTO);
    }

  
    public Optional<TeamMemberDTO> findById(Long id) {
        return repo.findById(id).map(this::toDTO);
    }

    
    public TeamMemberDTO create(TeamMemberDTO dto) {
        Team team = teamRepo.findById(dto.getTeamId())
                .orElseThrow(() -> new RuntimeException("Team not found"));
        AppUser user = userRepo.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        TeamMember member = new TeamMember();
        member.setTeam(team);
        member.setUser(user);
        member.setRole(dto.getRole());
        member.setJoinedAt(LocalDateTime.now());

        return toDTO(repo.save(member));
    }

    
    public TeamMemberDTO update(Long id, TeamMemberDTO dto) {
        return repo.findById(id).map(existing -> {
            existing.setRole(dto.getRole());
            existing.setJoinedAt(dto.getJoinedAt());
            
            return toDTO(repo.save(existing));
        }).orElse(null);
    }

    public boolean delete(Long id) {
        if (repo.existsById(id)) {
            repo.deleteById(id);
            return true;
        }
        return false;
    }

    private TeamMemberDTO toDTO(TeamMember member) {
    TeamMemberDTO dto = new TeamMemberDTO();
    dto.setTeamMemberId(member.getTeamMemberId());
    dto.setTeamId(Long.valueOf(member.getTeam().getTeamId()));
    dto.setUserId(Long.valueOf(member.getUser ().getUserId()));
    dto.setRole(member.getRole());
    dto.setJoinedAt(member.getJoinedAt());
    return dto;
    }


}

