package com.springboot.MyTodoList.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import javax.persistence.*;

@Entity
@Table(name = "SPRINT")
public class Sprint {
    @Id
    @Column(name="sprint_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long sprintId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="project_id", nullable=false)
    private Project project;

    @Column(name="name", nullable=false, length=120)
    private String name;

    @Column(name="goal", length=400)
    private String goal;

    @Column(name="start_date")
    private LocalDate startDate;

    @Column(name="end_date")
    private LocalDate endDate;

    @Column(name="status", length=20)
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="created_by", nullable=false)
    private AppUser createdBy;

    @Column(name="created_at")
    private LocalDateTime createdAt;

    @Column(name="updated_at")
    private LocalDateTime updatedAt;

    public Sprint() {}
    // getters y setters
}
