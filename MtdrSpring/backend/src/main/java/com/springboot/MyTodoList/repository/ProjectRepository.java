package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    
    List<Project> findByTeamId(Long teamId);
    
    @Query("SELECT p FROM Project p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Project> searchByName(@Param("name") String name);
    
    List<Project> findByCreatedById(Long createdById);

    @Query("SELECT p FROM Project p JOIN p.team t JOIN t.members m WHERE m.user.id = :userId")
    List<Project> findByUserId(@Param("userId") Long userId);
}