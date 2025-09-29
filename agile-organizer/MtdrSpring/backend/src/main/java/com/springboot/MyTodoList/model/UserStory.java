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
  Representation of the USER_STORY table that exists already
  in the autonomous database (Oracle)

  CREATE TABLE USER_STORY (
    story_id     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    team_id      NUMBER   NOT NULL,
    title        VARCHAR2(200) NOT NULL,
    description  CLOB,
    story_points NUMBER,
    priority     NUMBER,  -- 1..5
    status       VARCHAR2(20) DEFAULT 'backlog' NOT NULL,
    created_by   NUMBER   NOT NULL,
    created_at   TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at   TIMESTAMP
  );
*/

@Entity
@Table(name = "USER_STORY")
public class UserStory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "STORY_ID")
    private int id;

    @Column(name = "TEAM_ID", nullable = false)
    private int teamId;

    @Column(name = "TITLE", nullable = false, length = 200)
    private String title;

    @Lob
    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "STORY_POINTS")
    private Integer storyPoints;

    @Column(name = "PRIORITY")
    private Integer priority;

    @Column(name = "STATUS", nullable = false, length = 20)
    private String status = "backlog"; // además del DEFAULT en BD

    @Column(name = "CREATED_BY", nullable = false)
    private int createdBy;

    // Deja que Oracle aplique DEFAULT SYSTIMESTAMP (no lo envía JPA)
    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false) // quita insertable=false
    private LocalDateTime createdAt;


    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    // ---- Constructores ----
    public UserStory() {}

    public UserStory(int teamId, String title, String description, Integer storyPoints,
                     Integer priority, String status, int createdBy) {
        this.teamId = teamId;
        this.title = title;
        this.description = description;
        this.storyPoints = storyPoints;
        this.priority = priority;
        this.status = status;
        this.createdBy = createdBy;
    }

    // ---- Getters & Setters ----
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getTeamId() { return teamId; }
    public void setTeamId(int teamId) { this.teamId = teamId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getStoryPoints() { return storyPoints; }
    public void setStoryPoints(Integer storyPoints) { this.storyPoints = storyPoints; }

    public Integer getPriority() { return priority; }
    public void setPriority(Integer priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getCreatedBy() { return createdBy; }
    public void setCreatedBy(int createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
