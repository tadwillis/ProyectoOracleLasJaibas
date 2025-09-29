package com.springboot.MyTodoList.model;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.Table;

import org.hibernate.annotations.CreationTimestamp;

/*
    Representation of the PROJECT table that exists already in the autonomous database

    CREATE TABLE PROJECT (
      project_id  NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      team_id     NUMBER   NOT NULL,
      name        VARCHAR2(150) NOT NULL,
      description CLOB,
      created_by  NUMBER   NOT NULL, -- FK -> APP_USER
      created_at  TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
    );
*/

@Entity
@Table(name = "PROJECT")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PROJECT_ID")
    private int id;

    @Column(name = "TEAM_ID", nullable = false)
    private int teamId;

    @Column(name = "NAME", nullable = false, length = 150)
    private String name;

    @Lob
    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "CREATED_BY", nullable = false)
    private int createdBy;

    // Deja que Oracle ponga el DEFAULT SYSTIMESTAMP (no lo envía JPA)
    @CreationTimestamp
    @Column(name = "CREATED_AT", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Project() {}

    public Project(int teamId, String name, String description, int createdBy) {
        this.teamId = teamId;
        this.name = name;
        this.description = description;
        this.createdBy = createdBy;
    }

    // Getters & Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getTeamId() { return teamId; }
    public void setTeamId(int teamId) { this.teamId = teamId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getCreatedBy() { return createdBy; }
    public void setCreatedBy(int createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
