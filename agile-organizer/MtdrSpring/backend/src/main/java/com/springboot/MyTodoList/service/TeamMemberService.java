package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.entity.TeamMember;
import com.springboot.MyTodoList.entity.Team;
import com.springboot.MyTodoList.entity.AppUser;
import com.springboot.MyTodoList.model.TeamMemberDTO;
import com.springboot.MyTodoList.repository.TeamMemberRepository;
import com.springboot.MyTodoList.repository.TeamRepository;
import com.springboot.MyTodoList.repository.AppUserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TeamMemberService {

    private final TeamMemberRepository repo;
    private final TeamRepository teamRepo;
    private final AppUserRepository userRepo;

    public TeamMemberService(TeamMemberRepository repo, TeamRepository teamRepo, AppUserRepository userRepo) {
        this.repo = repo;
        this.teamRepo = teamRepo;
        this.userRepo = userRepo;
    }

    public List<TeamMemberDTO> findAll() {
        return repo.findAll().stream().map(this::toDTO).collect(Collectors.toList());
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

    public void delete(Long id) {
        repo.deleteById(id);
    }

    private TeamMemberDTO toDTO(TeamMember member) {
        TeamMemberDTO dto = new TeamMemberDTO();
        dto.setTeamMemberId(member.getTeamMemberId());
        dto.setTeamId(member.getTeam().getTeamId());
        dto.setUserId(member.getUser().getUserId());
        dto.setRole(member.getRole());
        dto.setJoinedAt(member.getJoinedAt());
        return dto;
    }
}
