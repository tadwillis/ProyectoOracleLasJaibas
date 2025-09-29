package com.springboot.MyTodoList.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import javax.persistence.*;

@Entity
@Table(name = "TASK")
public class Task {
    @Id
    @Column(name="task_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long taskId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="story_id", nullable=false)
    private UserStory story;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="sprint_id")
    private Sprint sprint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="team_id", nullable=false)
    private Team team;

    @Column(name="title", nullable=false, length=200)
    private String title;

    @Lob
    @Column(name="description")
    private String description;

    @Column(name="status", length=20)
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="assigned_user_id")
    private AppUser assignedUser;

    @Column(name="effort_hours")
    private Integer effortHours;

    @Column(name="priority")
    private Integer priority;

    @Column(name="start_date")
    private LocalDate startDate;

    @Column(name="end_date")
    private LocalDate endDate;

    @Column(name="created_at")
    private LocalDateTime createdAt;

    @Column(name="updated_at")
    private LocalDateTime updatedAt;

    public Task() {}
    // getters y setters
}
