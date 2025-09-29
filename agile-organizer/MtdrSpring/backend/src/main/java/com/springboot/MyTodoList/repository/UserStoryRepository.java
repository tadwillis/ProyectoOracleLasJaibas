package com.springboot.MyTodoList.repository;

import javax.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import com.springboot.MyTodoList.model.UserStory;

@Repository
@Transactional
@EnableTransactionManagement
public interface UserStoryRepository extends JpaRepository<UserStory, Integer> {
    // Métodos opcionales de búsqueda (si luego los necesitas):
    // List<UserStory> findByTeamId(int teamId);
    // List<UserStory> findByStatus(String status);
    // List<UserStory> findByTitleContainingIgnoreCase(String title);
}
