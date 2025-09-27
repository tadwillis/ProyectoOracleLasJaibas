package com.springboot.MyTodoList.entity;

import java.time.LocalDateTime;
import javax.persistence.*;

@Entity
@Table(name = "TEAM")
public class Team {
    @Id
    @Column(name="team_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long teamId;

    @Column(name="name", nullable=false, length=120)
    private String name;

    @Lob
    @Column(name="description")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="created_by", nullable=false)
    private AppUser createdBy;

    @Column(name="created_at")
    private LocalDateTime createdAt;

    public Team() {}
    // getters/setters

    public void setName(String string) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setName'");
    }

    public void setCreatedBy(AppUser u) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setCreatedBy'");
    }

    public void setCreatedAt(LocalDateTime now) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setCreatedAt'");
    }

    public String getTeamId() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getTeamId'");
    }
}
