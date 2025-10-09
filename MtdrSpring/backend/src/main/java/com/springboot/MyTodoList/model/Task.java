package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "TASK")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(columnDefinition = "CLOB")
    private String description;
    
    @ManyToOne
    @JoinColumn(name = "user_story_id")
    @JsonIgnoreProperties({"tasks", "team", "project", "assignedTo", "createdBy"})
    private UserStory userStory;
    
    @ManyToOne
    @JoinColumn(name = "sprint_id")
    @JsonIgnoreProperties({"tasks", "team", "project"})
    private Sprint sprint;  // ✅ AGREGAR ESTE CAMPO
    
    @ManyToOne
    @JoinColumn(name = "team_id")
    @JsonIgnoreProperties({"members", "projects", "stories", "createdBy"})
    private Team team;
    
    @ManyToOne
    @JoinColumn(name = "assigned_to")
    @JsonIgnoreProperties({"createdTeams", "teamMemberships"})
    private AppUser assignedTo;
    
    @Builder.Default
    @Column(length = 50)
    private String status = "todo";
    
    @Column(length = 50)
    private String priority;
    
    @Column(name = "due_date")
    private LocalDateTime dueDate;
    
    @Column(name = "start_date")
    private LocalDateTime startDate;
    
    @Column(name = "end_date")
    private LocalDateTime endDate;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Builder.Default
    @Column(name = "estimated_hours")
    private Integer estimatedHours = 0;
    
    @Column(name = "effort_hours")
    private Integer effortHours;
    
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