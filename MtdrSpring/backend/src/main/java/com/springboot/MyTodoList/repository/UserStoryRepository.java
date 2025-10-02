package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.UserStory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserStoryRepository extends JpaRepository<UserStory, Long> {
    
    List<UserStory> findByTeamId(Long teamId);
    
    List<UserStory> findByTeamIdAndStatus(Long teamId, String status);
    
    @Query("SELECT s FROM UserStory s WHERE s.team.id = :teamId ORDER BY s.priority DESC")
    List<UserStory> findByTeamIdOrderByPriority(@Param("teamId") Long teamId);
    
    @Query("SELECT s FROM UserStory s WHERE LOWER(s.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<UserStory> searchByTitle(@Param("keyword") String keyword);
    
    List<UserStory> findByCreatedById(Long createdById);
}