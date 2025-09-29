package com.springboot.MyTodoList.entity;

import java.time.LocalDateTime;
import javax.persistence.*;

@Entity
@Table(name = "APP_USER")
public class AppUser {
    @Id
    @Column(name="user_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(name="username", nullable=false, unique=true, length=60)
    private String username;

    @Column(name="email", nullable=false, unique=true, length=150)
    private String email;

    @Column(name="full_name", length=120)
    private String fullName;

    @Column(name="password_hash", nullable=false, length=200)
    private String passwordHash;

    @Column(name="phone", length=30)
    private String phone;

    @Column(name="status", length=20)
    private String status;

    @Column(name="created_at")
    private LocalDateTime createdAt;

    @Column(name="last_login")
    private LocalDateTime lastLogin;

    public AppUser() {}
    // getters/setters

    public void setUsername(String string) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setUsername'");
    }

    public void setEmail(String string) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setEmail'");
    }

    public void setPasswordHash(String string) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setPasswordHash'");
    }

    public void setCreatedAt(LocalDateTime now) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setCreatedAt'");
    }

    public String getUserId() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getUserId'");
    }
}
