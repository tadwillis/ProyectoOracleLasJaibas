package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.AppUser;
import com.springboot.MyTodoList.model.Team;
import com.springboot.MyTodoList.model.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    
    List<TeamMember> findByTeamId(Long teamId);
    
    List<TeamMember> findByUser(AppUser user);
    
    Optional<TeamMember> findByTeamAndUser(Team team, AppUser user);
    
    boolean existsByTeamAndUser(Team team, AppUser user);
    
    void deleteByTeamAndUser(Team team, AppUser user);
    
    List<TeamMember> findByRole(String role);
}