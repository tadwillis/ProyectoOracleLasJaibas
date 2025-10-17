package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.Date; // 💡 Usar java.util.Date para Oracle DATE
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "TASK")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {
    
    @Id
    // 💡 CORREGIDO: Usar SEQUENCE para Oracle y la secuencia que muestra tu CSV
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "task_seq")
    @SequenceGenerator(name = "task_seq", sequenceName = "ISEQ$$_146693", allocationSize = 1)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(columnDefinition = "CLOB")
    private String description;
    
    // 💡 CORREGIDO: Usar la columna obligatoria STORY_ID
    @ManyToOne(optional = false) 
    @JoinColumn(name = "story_id", nullable = false)
    @JsonIgnoreProperties({"tasks", "team", "project", "assignedTo", "createdBy"})
    private UserStory userStory;
    
    @ManyToOne
    @JoinColumn(name = "sprint_id")
    @JsonIgnoreProperties({"tasks", "team", "project"})
    private Sprint sprint;
    
    @ManyToOne(optional = false)
    @JoinColumn(name = "team_id", nullable = false) // Team ID es NOT NULL según tu esquema original
    @JsonIgnoreProperties({"members", "projects", "stories", "createdBy"})
    private Team team;
    
    // 💡 CORREGIDO: Usar la columna correcta ASSIGNED_USER_ID
    @ManyToOne
    @JoinColumn(name = "assigned_user_id")
    @JsonIgnoreProperties({"createdTeams", "teamMemberships"})
    private AppUser assignedTo;
    
    @Builder.Default
    @Column(length = 50, nullable = false) // Status es NOT NULL
    private String status = "todo";
    
    // 💡 CORREGIDO: Tipo de dato Integer, no String
    @Builder.Default
    @Column(nullable = false) 
    private Integer priority = 0; 
    
    // 💡 CORREGIDO: Uso de Date y TemporalType para Oracle DATE
    @Column(name = "due_date")
    @Temporal(TemporalType.DATE)
    private Date dueDate;
    
    @Column(name = "start_date")
    @Temporal(TemporalType.DATE)
    private Date startDate;
    
    @Column(name = "end_date")
    @Temporal(TemporalType.DATE)
    private Date endDate;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;
    
    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;
    
    @Builder.Default
    @Column(name = "estimated_hours")
    private Integer estimatedHours = 0;
    
    @Column(name = "effort_hours")
    private Integer effortHours;
    
    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        updatedAt = new Date();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }
}