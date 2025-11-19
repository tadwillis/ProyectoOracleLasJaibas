package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    List<Task> findByUserStoryId(Long userStoryId);  // ✅ Cambié de findByStoryId
    
    List<Task> findBySprintId(Long sprintId);
    
    List<Task> findByTeamId(Long teamId);
    
    List<Task> findByAssignedToId(Long userId);  // ✅ Cambié de findByAssignedUserId
    
    List<Task> findByAssignedToIdAndStatus(Long userId, String status);  // ✅ Cambié de findByAssignedUserIdAndStatus
    
    @Query("SELECT t FROM Task t WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Task> searchByTitle(@Param("keyword") String keyword);
    
    @Query("SELECT t FROM Task t WHERE t.sprint.id = :sprintId AND t.status = :status")
    List<Task> findBySprintIdAndStatus(@Param("sprintId") Long sprintId, @Param("status") String status);

    @Query("SELECT SUM(t.effortHours) FROM Task t WHERE t.sprint.id = :sprintId AND t.status = 'done'")
    Double getTotalHoursBySprint(@Param("sprintId") Long sprintId);
    
    @Query("""
        SELECT SUM(t.effortHours)
        FROM Task t
        WHERE t.sprint.id = :sprintId
        AND t.assignedTo.username = :username
        AND t.status = 'done'
    """)
    Double getUserDoneHoursBySprint(
            @Param("sprintId") Long sprintId,
            @Param("username") String username
    );

    @Query("SELECT SUM(t.effortHours) FROM Task t " +
        "WHERE t.assignedTo.id = :userId " +
        "AND t.sprint.id = :sprintId " +
        "AND t.status = :status")
    Integer sumHoursByUserAndSprintAndStatus(
            @Param("userId") Long userId,
            @Param("sprintId") Long sprintId,
            @Param("status") String status
    );

}