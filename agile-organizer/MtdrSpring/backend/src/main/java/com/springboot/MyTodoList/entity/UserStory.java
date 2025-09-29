package com.springboot.MyTodoList.entity;

import java.time.LocalDateTime;
import javax.persistence.*;

@Entity
@Table(name = "USER_STORY")
public class UserStory {

    @Id
    @Column(name = "story_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY) // si usas Oracle <12c, usa SequenceGenerator
    private Long storyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Lob
    @Column(name = "description")
    private String description;

    @Column(name = "story_points")
    private Integer storyPoints;

    @Column(name = "priority")
    private Integer priority;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "backlog";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private AppUser createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructor vacío necesario para JPA
    public UserStory() {}

    public void setTitle(String string) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setTitle'");
    }

    public void setDescription(String string) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setDescription'");
    }

    public void setTeam(Team t) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setTeam'");
    }

    public void setCreatedBy(AppUser u) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setCreatedBy'");
    }

    public void setCreatedBy(LocalDateTime now) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setCreatedBy'");
    }

    public String getStoryId() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getStoryId'");
    }

    // Getters y setters (genera con tu IDE: Alt+Insert en IntelliJ / Source -> Generate en Eclipse)
    // public Long getStoryId() { ... }  etc.

}
