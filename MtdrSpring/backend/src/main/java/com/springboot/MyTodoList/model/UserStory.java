package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

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
    
    @Column(name = "story_points")
    private Integer storyPoints;
    
    @Column(name = "estimated_hours", columnDefinition = "NUMBER(10,2)")
    private Double estimatedHours;
    
    @Column(nullable = false)
    private Integer priority = 0;
    
    @Column(nullable = false, length = 50)
    private String status = "backlog";
    
    @ManyToOne
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;
    
    @ManyToOne
    @JoinColumn(name = "created_by_id", nullable = false)
    private AppUser createdBy;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "story")
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