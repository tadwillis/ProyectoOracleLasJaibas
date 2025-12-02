package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Long> {
    
    List<Sprint> findByProjectId(Long projectId);
    
    List<Sprint> findByStatus(String status);
    
    @Query("SELECT s FROM Sprint s WHERE s.project.team.id = :teamId AND s.status = 'active'")
    List<Sprint> findActiveSprintsByTeamId(@Param("teamId") Long teamId);
    
    @Query("SELECT s FROM Sprint s WHERE s.project.id = :projectId ORDER BY s.startDate DESC")
    List<Sprint> findByProjectIdOrderByStartDate(@Param("projectId") Long projectId);

    @Query("SELECT s FROM Sprint s JOIN s.project p JOIN p.team t JOIN t.members m WHERE m.user.id = :userId")
    List<Sprint> findByUserId(@Param("userId") Long userId);
}