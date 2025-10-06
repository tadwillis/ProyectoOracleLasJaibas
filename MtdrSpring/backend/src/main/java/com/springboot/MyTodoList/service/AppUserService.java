package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.AppUser;
import com.springboot.MyTodoList.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final PasswordEncoder passwordEncoder; // <-- AGREGAR
    
    public AppUser createUser(AppUser user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        
        // Encriptar password antes de guardar
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
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
        
        // Si se proporciona un nuevo password, encriptarlo
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }
        
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
    
    // Método adicional para validar password
    public boolean validatePassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
}