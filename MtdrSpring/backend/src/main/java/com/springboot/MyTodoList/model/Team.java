package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "teams")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Team {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(columnDefinition = "CLOB")
    private String description;
    
    @ManyToOne
    @JoinColumn(name = "created_by_id", nullable = false)
    @JsonIgnoreProperties("createdTeams")  // Prevent circular reference to user's teams
    private AppUser createdBy;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("team")  // Prevent circular reference to team
    private List<TeamMember> members;
    
    @OneToMany(mappedBy = "team")
    @JsonIgnoreProperties("team")  // Prevent circular reference to team
    private List<Project> projects;
    
    @OneToMany(mappedBy = "team")
    @JsonIgnoreProperties("team")  // Prevent circular reference to team
    private List<UserStory> stories;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}