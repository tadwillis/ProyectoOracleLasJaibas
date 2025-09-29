package com.springboot.MyTodoList.entity;

import java.time.LocalDateTime;
import javax.persistence.*;

@Entity
@Table(name = "PROJECT")
public class Project {
    @Id
    @Column(name="project_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long projectId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="team_id", nullable=false)
    private Team team;

    @Column(name="name", nullable=false, length=150)
    private String name;

    @Lob
    @Column(name="description")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="created_by", nullable=false)
    private AppUser createdBy;

    @Column(name="created_at")
    private LocalDateTime createdAt;

    public Project() {}
    // getters y setters
}

