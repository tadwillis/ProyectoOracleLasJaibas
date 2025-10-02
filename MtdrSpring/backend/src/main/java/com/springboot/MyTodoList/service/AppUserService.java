package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.AppUser;
import com.springboot.MyTodoList.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class AppUserService {
    
    private final AppUserRepository userRepository;
    
    public AppUser createUser(AppUser user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        return userRepository.save(user);
    }
    
    public Optional<AppUser> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    public Optional<AppUser> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    public Optional<AppUser> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public List<AppUser> getAllUsers() {
        return userRepository.findAll();
    }
    
    public List<AppUser> getUsersByStatus(String status) {
        return userRepository.findByStatus(status);
    }
    
    public AppUser updateUser(Long id, AppUser userDetails) {
        AppUser user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setFullName(userDetails.getFullName());
        user.setPhone(userDetails.getPhone());
        user.setStatus(userDetails.getStatus());
        
        return userRepository.save(user);
    }
    
    public void updateLastLogin(Long userId) {
        AppUser user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
    }
    
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
    
    public List<AppUser> searchUsersByName(String name) {
        return userRepository.searchByFullName(name);
    }
}