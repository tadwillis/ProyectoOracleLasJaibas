package com.springboot.MyTodoList.entity;

import java.time.LocalDateTime;
import javax.persistence.*;

@Entity
@Table(
    name = "TEAM_MEMBER",
    uniqueConstraints = { @UniqueConstraint(columnNames = {"team_id","user_id"}) }
)
public class TeamMember {

    @Id
    @Column(name = "team_member_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long teamMemberId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(name = "role", nullable = false, length = 20)
    private String role;

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    // --- Constructor vacío ---
    public TeamMember() {
    }

    // --- Getters y Setters ---

    public Long getTeamMemberId() {
        return teamMemberId;
    }

    public void setTeamMemberId(Long teamMemberId) {
        this.teamMemberId = teamMemberId;
    }

    public Team getTeam() {
        return team;
    }

    public void setTeam(Team team) {
        this.team = team;
    }

    public AppUser getUser() {
        return user;
    }

    public void setUser(AppUser user) {
        this.user = user;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }
}
