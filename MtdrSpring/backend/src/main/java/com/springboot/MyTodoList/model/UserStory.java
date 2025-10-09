package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "user_stories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(columnDefinition = "CLOB")
    private String description;
    
    @ManyToOne
    @JoinColumn(name = "team_id", nullable = false)
    @JsonIgnoreProperties({"stories", "members", "projects", "createdBy"})
    private Team team;
    
    @ManyToOne
    @JoinColumn(name = "project_id")
    @JsonIgnoreProperties({"userStories", "team"})
    private Project project;
    
    @ManyToOne
    @JoinColumn(name = "created_by_id")
    @JsonIgnoreProperties({"createdTeams", "teamMemberships"})
    private AppUser createdBy;
    
    @ManyToOne
    @JoinColumn(name = "assigned_to")
    @JsonIgnoreProperties({"createdTeams", "teamMemberships"})
    private AppUser assignedTo;
    
    @Builder.Default
    @Column(length = 50)
    private String status = "backlog";
    
    @Builder.Default
    @Column(length = 50)
    private String priority = "medium";
    
    @Column(name = "story_points")
    private Integer storyPoints;
    
    @Column(name = "estimated_hours")
    private Integer estimatedHours;  // ✅ AGREGAR ESTE CAMPO
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "due_date")
    private LocalDateTime dueDate;
    
    @OneToMany(mappedBy = "userStory", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("userStory")
    private List<Task> tasks;
    
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