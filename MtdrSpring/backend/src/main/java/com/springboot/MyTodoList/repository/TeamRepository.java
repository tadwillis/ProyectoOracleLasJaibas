package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    
    @Query("SELECT DISTINCT t FROM Team t JOIN t.members tm WHERE tm.user.id = :userId")
    List<Team> findTeamsByUserId(@Param("userId") Long userId);
    
    @Query("SELECT t FROM Team t WHERE LOWER(t.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Team> searchByName(@Param("name") String name);
    
    List<Team> findByCreatedById(Long createdById);
}