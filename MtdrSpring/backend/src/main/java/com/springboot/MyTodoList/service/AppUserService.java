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
    private final PasswordEncoder passwordEncoder;
    
    /**
     * Crear un nuevo usuario
     */
    public AppUser createUser(AppUser user) {
        // Validar que el username no exista
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("El nombre de usuario ya existe");
        }
        
        // Validar que el email no exista
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }
        
        // Validar campos requeridos
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de usuario es requerido");
        }
        
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("El email es requerido");
        }
        
        if (user.getPassword() == null || user.getPassword().length() < 6) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 6 caracteres");
        }
        
        // Encriptar password antes de guardar
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Establecer valores por defecto si no están presentes
        if (user.getRole() == null) {
            user.setRole("USER");
        }
        
        if (user.getStatus() == null) {
            user.setStatus("active");
        }
        
        // Establecer fecha de creación
        user.setCreatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }
    
    /**
     * Obtener usuario por ID
     */
    public Optional<AppUser> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    /**
     * Obtener usuario por username
     */
    public Optional<AppUser> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    /**
     * Obtener usuario por email
     */
    public Optional<AppUser> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    /**
     * Obtener todos los usuarios
     */
    public List<AppUser> getAllUsers() {
        return userRepository.findAll();
    }
    
    /**
     * Obtener usuarios por estado
     */
    public List<AppUser> getUsersByStatus(String status) {
        return userRepository.findByStatus(status);
    }
    
    /**
     * Buscar usuarios por nombre
     */
    public List<AppUser> searchUsersByName(String name) {
        return userRepository.searchByFullName(name);
    }
    
    /**
     * Actualizar usuario
     */
    public AppUser updateUser(Long id, AppUser userDetails) {
        AppUser user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
        
        // Validar username único si cambió
        if (!user.getUsername().equals(userDetails.getUsername())) {
            if (userRepository.existsByUsername(userDetails.getUsername())) {
                throw new IllegalArgumentException("El nombre de usuario ya existe");
            }
            user.setUsername(userDetails.getUsername());
        }
        
        // Validar email único si cambió
        if (!user.getEmail().equals(userDetails.getEmail())) {
            if (userRepository.existsByEmail(userDetails.getEmail())) {
                throw new IllegalArgumentException("El email ya está registrado");
            }
            user.setEmail(userDetails.getEmail());
        }
        
        // Actualizar campos básicos
        if (userDetails.getFullName() != null) {
            user.setFullName(userDetails.getFullName());
        }
        
        if (userDetails.getPhone() != null) {
            user.setPhone(userDetails.getPhone());
        }
        
        if (userDetails.getRole() != null) {
            user.setRole(userDetails.getRole());
        }
        
        if (userDetails.getStatus() != null) {
            user.setStatus(userDetails.getStatus());
        }
        
        // Actualizar password solo si se proporciona una nueva
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            if (userDetails.getPassword().length() < 6) {
                throw new IllegalArgumentException("La contraseña debe tener al menos 6 caracteres");
            }
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }
        
        // Actualizar fecha de modificación
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }
    
    /**
     * Actualizar último acceso
     */
    public void updateLastLogin(Long userId) {
        AppUser user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + userId));
        
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
    }
    
    /**
     * Cambiar contraseña
     */
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        AppUser user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + userId));
        
        // Verificar contraseña actual
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("La contraseña actual es incorrecta");
        }
        
        // Validar nueva contraseña
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("La nueva contraseña debe tener al menos 6 caracteres");
        }
        
        // Actualizar contraseña
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }
    
    /**
     * Cambiar estado del usuario
     */
    public AppUser changeUserStatus(Long userId, String newStatus) {
        AppUser user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + userId));
        
        if (!newStatus.equals("active") && !newStatus.equals("inactive")) {
            throw new IllegalArgumentException("Estado inválido. Use 'active' o 'inactive'");
        }
        
        user.setStatus(newStatus);
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    /**
     * Cambiar rol del usuario
     */
    public AppUser changeUserRole(Long userId, String newRole) {
        AppUser user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + userId));
        
        if (!newRole.equals("USER") && !newRole.equals("ADMIN") && !newRole.equals("MANAGER")) {
            throw new IllegalArgumentException("Rol inválido. Use 'USER', 'ADMIN' o 'MANAGER'");
        }
        
        // Validar que no se elimine el último admin
        if ((user.getRole().equals("ADMIN") || user.getRole().equals("MANAGER")) && (!newRole.equals("ADMIN") && !newRole.equals("MANAGER"))) {
            long adminCount = userRepository.findAll().stream()
                .filter(u -> u.getRole().equals("ADMIN") || u.getRole().equals("MANAGER"))
                .count();
            
            if (adminCount <= 1) {
                throw new IllegalArgumentException("No se puede eliminar el último administrador del sistema");
            }
        }
        
        user.setRole(newRole);
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    /**
     * Eliminar usuario
     */
    public void deleteUser(Long id) {
        AppUser user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
        
        // Validar que no se elimine el último admin
        if (user.getRole().equals("ADMIN")) {
            long adminCount = userRepository.findAll().stream()
                .filter(u -> u.getRole().equals("ADMIN"))
                .count();
            
            if (adminCount <= 1) {
                throw new IllegalArgumentException("No se puede eliminar el último administrador del sistema");
            }
        }
        
        userRepository.delete(user);
    }
    
    /**
     * Verificar si existe un usuario con un username
     */
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
    
    /**
     * Verificar si existe un usuario con un email
     */
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    /**
     * Obtener estadísticas de usuarios
     */
    public UserStatistics getUserStatistics() {
        List<AppUser> allUsers = userRepository.findAll();
        
        UserStatistics stats = new UserStatistics();
        stats.setTotal(allUsers.size());
        stats.setAdmins((int) allUsers.stream().filter(u -> u.getRole().equals("ADMIN")).count());
        stats.setUsers((int) allUsers.stream().filter(u -> u.getRole().equals("USER")).count());
        stats.setActive((int) allUsers.stream().filter(u -> u.getStatus().equals("active")).count());
        stats.setInactive((int) allUsers.stream().filter(u -> u.getStatus().equals("inactive")).count());
        
        return stats;
    }
    
    /**
     * Clase interna para estadísticas
     */
    public static class UserStatistics {
        private int total;
        private int admins;
        private int users;
        private int active;
        private int inactive;
        
        // Getters y Setters
        public int getTotal() { return total; }
        public void setTotal(int total) { this.total = total; }
        
        public int getAdmins() { return admins; }
        public void setAdmins(int admins) { this.admins = admins; }
        
        public int getUsers() { return users; }
        public void setUsers(int users) { this.users = users; }
        
        public int getActive() { return active; }
        public void setActive(int active) { this.active = active; }
        
        public int getInactive() { return inactive; }
        public void setInactive(int inactive) { this.inactive = inactive; }
    }
}