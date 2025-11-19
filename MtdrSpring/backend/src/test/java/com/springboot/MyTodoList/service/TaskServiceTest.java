package com.springboot.MyTodoList.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.springboot.MyTodoList.model.AppUser;
import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.model.Task;
import com.springboot.MyTodoList.model.Team;
import com.springboot.MyTodoList.model.UserStory;
import com.springboot.MyTodoList.repository.AppUserRepository;
import com.springboot.MyTodoList.repository.SprintRepository;
import com.springboot.MyTodoList.repository.TaskRepository;
import com.springboot.MyTodoList.repository.TeamRepository;
import com.springboot.MyTodoList.repository.UserStoryRepository;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserStoryRepository storyRepository;

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private AppUserRepository userRepository;

    @Mock
    private SprintRepository sprintRepository;

    @InjectMocks
    private TaskService taskService;

    private Task testTask;
    private UserStory testStory;
    private Team testTeam;
    private AppUser testUser;
    private Sprint testSprint;

    @BeforeEach
    void setUp() {
        // Setup test team
        testTeam = new Team();
        testTeam.setId(1L);
        testTeam.setName("Test Team");

        // Setup test user
        testUser = new AppUser();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setFullName("Test User");

        // Setup test sprint
        testSprint = new Sprint();
        testSprint.setId(1L);
        testSprint.setName("Sprint 1");

        // Setup test story
        testStory = new UserStory();
        testStory.setId(1L);
        testStory.setTitle("Test Story");

        // Setup test task
        testTask = Task.builder()
                .id(1L)
                .title("Test Task")
                .description("Test Description")
                .status("todo")
                .priority(1)
                .estimatedHours(8)
                .effortHours(6)
                .userStory(testStory)
                .team(testTeam)
                .assignedTo(testUser)
                .sprint(testSprint)
                .build();
    }

    @Test
    void createTask_WithSprint_Success() {
        // Arrange
        Task newTask = Task.builder()
                .title("New Task")
                .sprint(testSprint)
                .build();

        when(storyRepository.findById(1L)).thenReturn(Optional.of(testStory));
        when(teamRepository.findById(1L)).thenReturn(Optional.of(testTeam));
        when(sprintRepository.findById(1L)).thenReturn(Optional.of(testSprint));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);

        // Act
        Task result = taskService.createTask(newTask, 1L, 1L);

        // Assert
        assertNotNull(result);
        verify(storyRepository).findById(1L);
        verify(teamRepository).findById(1L);
        verify(sprintRepository).findById(1L);
        verify(taskRepository).save(newTask);
        assertEquals(testStory, newTask.getUserStory());
        assertEquals(testTeam, newTask.getTeam());
        assertEquals(testSprint, newTask.getSprint());
    }

    @Test
    void createTask_WithoutSprint_Success() {
        // Arrange
        Task newTask = Task.builder()
                .title("New Task")
                .sprint(null)
                .build();

        when(storyRepository.findById(1L)).thenReturn(Optional.of(testStory));
        when(teamRepository.findById(1L)).thenReturn(Optional.of(testTeam));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);

        // Act
        Task result = taskService.createTask(newTask, 1L, 1L);

        // Assert
        assertNotNull(result);
        verify(storyRepository).findById(1L);
        verify(teamRepository).findById(1L);
        verify(sprintRepository, never()).findById(anyLong());
        verify(taskRepository).save(newTask);
        assertNull(newTask.getSprint());
    }

    @Test
    void createTask_StoryNotFound_ThrowsException() {
        // Arrange
        Task newTask = Task.builder().title("New Task").build();
        when(storyRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            taskService.createTask(newTask, 1L, 1L);
        });

        assertEquals("Story not found", exception.getMessage());
        verify(storyRepository).findById(1L);
        verify(teamRepository, never()).findById(anyLong());
        verify(taskRepository, never()).save(any());
    }

    @Test
    void createTask_TeamNotFound_ThrowsException() {
        // Arrange
        Task newTask = Task.builder().title("New Task").build();
        when(storyRepository.findById(1L)).thenReturn(Optional.of(testStory));
        when(teamRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            taskService.createTask(newTask, 1L, 1L);
        });

        assertEquals("Team not found", exception.getMessage());
        verify(teamRepository).findById(1L);
        verify(taskRepository, never()).save(any());
    }

    @Test
    void createTask_SprintNotFound_ThrowsException() {
        // Arrange
        Task newTask = Task.builder()
                .title("New Task")
                .sprint(testSprint)
                .build();

        when(storyRepository.findById(1L)).thenReturn(Optional.of(testStory));
        when(teamRepository.findById(1L)).thenReturn(Optional.of(testTeam));
        when(sprintRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            taskService.createTask(newTask, 1L, 1L);
        });

        assertEquals("Sprint not found", exception.getMessage());
        verify(sprintRepository).findById(1L);
        verify(taskRepository, never()).save(any());
    }

    @Test
    void getTaskById_Found() {
        // Arrange
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));

        // Act
        Optional<Task> result = taskService.getTaskById(1L);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testTask.getId(), result.get().getId());
        assertEquals(testTask.getTitle(), result.get().getTitle());
        verify(taskRepository).findById(1L);
    }

    @Test
    void getTaskById_NotFound() {
        // Arrange
        when(taskRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act
        Optional<Task> result = taskService.getTaskById(999L);

        // Assert
        assertFalse(result.isPresent());
        verify(taskRepository).findById(999L);
    }

    @Test
    void getAllTasks_ReturnsAllTasks() {
        // Arrange
        Task task2 = Task.builder().id(2L).title("Task 2").build();
        List<Task> tasks = Arrays.asList(testTask, task2);
        when(taskRepository.findAll()).thenReturn(tasks);

        // Act
        List<Task> result = taskService.getAllTasks();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(taskRepository).findAll();
    }

    @Test
    void getTasksByStory_ReturnsStoryTasks() {
        // Arrange
        List<Task> tasks = Arrays.asList(testTask);
        when(taskRepository.findByUserStoryId(1L)).thenReturn(tasks);

        // Act
        List<Task> result = taskService.getTasksByStory(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(taskRepository).findByUserStoryId(1L);
    }

    @Test
    void getTasksBySprint_ReturnsSprintTasks() {
        // Arrange
        List<Task> tasks = Arrays.asList(testTask);
        when(taskRepository.findBySprintId(1L)).thenReturn(tasks);

        // Act
        List<Task> result = taskService.getTasksBySprint(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(taskRepository).findBySprintId(1L);
    }

    @Test
    void getTasksByTeam_ReturnsTeamTasks() {
        // Arrange
        List<Task> tasks = Arrays.asList(testTask);
        when(taskRepository.findByTeamId(1L)).thenReturn(tasks);

        // Act
        List<Task> result = taskService.getTasksByTeam(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(taskRepository).findByTeamId(1L);
    }

    @Test
    void getTasksByAssignedUser_ReturnsUserTasks() {
        // Arrange
        List<Task> tasks = Arrays.asList(testTask);
        when(taskRepository.findByAssignedToId(1L)).thenReturn(tasks);

        // Act
        List<Task> result = taskService.getTasksByAssignedUser(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(taskRepository).findByAssignedToId(1L);
    }

    @Test
    void getTasksByUserAndStatus_ReturnsFilteredTasks() {
        // Arrange
        List<Task> tasks = Arrays.asList(testTask);
        when(taskRepository.findByAssignedToIdAndStatus(1L, "done")).thenReturn(tasks);

        // Act
        List<Task> result = taskService.getTasksByUserAndStatus(1L, "done");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(taskRepository).findByAssignedToIdAndStatus(1L, "done");
    }

    @Test
    void getTasksByAssignedUsername_Success() {
        // Arrange
        List<Task> tasks = Arrays.asList(testTask);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(taskRepository.findByAssignedToId(1L)).thenReturn(tasks);

        // Act
        List<Task> result = taskService.getTasksByAssignedUsername("testuser");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(userRepository).findByUsername("testuser");
        verify(taskRepository).findByAssignedToId(1L);
    }

    @Test
    void getTasksByAssignedUsername_UserNotFound_ThrowsException() {
        // Arrange
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            taskService.getTasksByAssignedUsername("nonexistent");
        });

        assertEquals("User not found", exception.getMessage());
        verify(userRepository).findByUsername("nonexistent");
        verify(taskRepository, never()).findByAssignedToId(anyLong());
    }

    @Test
    void updateTask_WithSprintAndAssignedUser_Success() {
        // Arrange
        Task updatedDetails = Task.builder()
                .title("Updated Title")
                .description("Updated Description")
                .status("in_progress")
                .effortHours(10)
                .priority(2)
                .estimatedHours(12)
                .sprint(testSprint)
                .assignedTo(testUser)
                .build();

        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(sprintRepository.findById(1L)).thenReturn(Optional.of(testSprint));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);

        // Act
        Task result = taskService.updateTask(1L, updatedDetails);

        // Assert
        assertNotNull(result);
        assertEquals("Updated Title", testTask.getTitle());
        assertEquals("Updated Description", testTask.getDescription());
        assertEquals("in_progress", testTask.getStatus());
        assertEquals(10, testTask.getEffortHours());
        assertEquals(2, testTask.getPriority());
        assertEquals(12, testTask.getEstimatedHours());
        verify(taskRepository).findById(1L);
        verify(sprintRepository).findById(1L);
        verify(taskRepository).save(testTask);
    }

    @Test
    void updateTask_WithNullSprint_RemovesSprint() {
        // Arrange
        Task updatedDetails = Task.builder()
                .title("Updated Title")
                .sprint(null)
                .build();

        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);

        // Act
        Task result = taskService.updateTask(1L, updatedDetails);

        // Assert
        assertNotNull(result);
        assertNull(testTask.getSprint());
        verify(sprintRepository, never()).findById(anyLong());
        verify(taskRepository).save(testTask);
    }

    @Test
    void updateTask_WithNullAssignedTo_RemovesAssignment() {
        // Arrange
        Task updatedDetails = Task.builder()
                .title("Updated Title")
                .assignedTo(null)
                .build();

        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);

        // Act
        Task result = taskService.updateTask(1L, updatedDetails);

        // Assert
        assertNotNull(result);
        assertNull(testTask.getAssignedTo());
        verify(taskRepository).save(testTask);
    }

    @Test
    void updateTask_TaskNotFound_ThrowsException() {
        // Arrange
        Task updatedDetails = Task.builder().title("Updated").build();
        when(taskRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            taskService.updateTask(999L, updatedDetails);
        });

        assertEquals("Task not found", exception.getMessage());
        verify(taskRepository).findById(999L);
        verify(taskRepository, never()).save(any());
    }

    @Test
    void updateTask_SprintNotFound_ThrowsException() {
        // Arrange
        Task updatedDetails = Task.builder()
                .title("Updated")
                .sprint(testSprint)
                .build();

        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(sprintRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            taskService.updateTask(1L, updatedDetails);
        });

        assertEquals("Sprint not found", exception.getMessage());
        verify(sprintRepository).findById(1L);
        verify(taskRepository, never()).save(any());
    }

    @Test
    void assignTask_Success() {
        // Arrange
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);

        // Act
        Task result = taskService.assignTask(1L, 1L);

        // Assert
        assertNotNull(result);
        assertEquals(testUser, testTask.getAssignedTo());
        verify(taskRepository).findById(1L);
        verify(userRepository).findById(1L);
        verify(taskRepository).save(testTask);
    }

    @Test
    void assignTask_TaskNotFound_ThrowsException() {
        // Arrange
        when(taskRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            taskService.assignTask(999L, 1L);
        });

        assertEquals("Task not found", exception.getMessage());
        verify(taskRepository).findById(999L);
        verify(userRepository, never()).findById(anyLong());
    }

    @Test
    void assignTask_UserNotFound_ThrowsException() {
        // Arrange
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            taskService.assignTask(1L, 999L);
        });

        assertEquals("User not found", exception.getMessage());
        verify(userRepository).findById(999L);
        verify(taskRepository, never()).save(any());
    }

    @Test
    void updateTaskStatus_Success() {
        // Arrange
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);

        // Act
        Task result = taskService.updateTaskStatus(1L, "done");

        // Assert
        assertNotNull(result);
        assertEquals("done", testTask.getStatus());
        verify(taskRepository).findById(1L);
        verify(taskRepository).save(testTask);
    }

    @Test
    void updateTaskStatus_TaskNotFound_ThrowsException() {
        // Arrange
        when(taskRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            taskService.updateTaskStatus(999L, "done");
        });

        assertEquals("Task not found", exception.getMessage());
        verify(taskRepository).findById(999L);
        verify(taskRepository, never()).save(any());
    }

    @Test
    void deleteTask_Success() {
        // Arrange
        doNothing().when(taskRepository).deleteById(1L);

        // Act
        taskService.deleteTask(1L);

        // Assert
        verify(taskRepository).deleteById(1L);
    }

    @Test
    void getKpiUserHours_CalculatesCorrectly() {
        // Arrange
        Task task1 = Task.builder()
                .estimatedHours(10)
                .effortHours(8)
                .build();

        Task task2 = Task.builder()
                .estimatedHours(20)
                .effortHours(16)
                .build();

        Task task3 = Task.builder()
                .estimatedHours(null)
                .effortHours(null)
                .build();

        List<Task> tasks = Arrays.asList(task1, task2, task3);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(taskRepository.findByAssignedToId(1L)).thenReturn(tasks);

        // Act
        Map<String, Double> result = taskService.getKpiUserHours("testuser");

        // Assert
        assertNotNull(result);
        assertEquals(30.0, result.get("totalEstimatedHours")); // 10 + 20
        assertEquals(24.0, result.get("totalEffortHours")); // 8 + 16
        assertEquals(80.0, result.get("efficiency")); // (24/30) * 100
        verify(userRepository).findByUsername("testuser");
    }

    @Test
    void getKpiUserHours_WithZeroEstimated_ReturnsZeroEfficiency() {
        // Arrange
        List<Task> tasks = new ArrayList<>();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(taskRepository.findByAssignedToId(1L)).thenReturn(tasks);

        // Act
        Map<String, Double> result = taskService.getKpiUserHours("testuser");

        // Assert
        assertNotNull(result);
        assertEquals(0.0, result.get("totalEstimatedHours"));
        assertEquals(0.0, result.get("totalEffortHours"));
        assertEquals(0.0, result.get("efficiency"));
    }

    @Test
    void getKpiUserTasks_CalculatesCorrectly() {
        // Arrange
        Task task1 = Task.builder().status("todo").build();
        Task task2 = Task.builder().status("done").build();
        Task task3 = Task.builder().status("done").build();
        Task task4 = Task.builder().status("cancelled").build();

        List<Task> tasks = Arrays.asList(task1, task2, task3, task4);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(taskRepository.findByAssignedToId(1L)).thenReturn(tasks);

        // Act
        Map<String, Integer> result = taskService.getKpiUserTasks("testuser");

        // Assert
        assertNotNull(result);
        assertEquals(3, result.get("totalPlannedTasks")); // All except cancelled
        assertEquals(2, result.get("totalDoneTasks")); // Only done tasks
        assertEquals(66, result.get("efficiency")); // (2*100)/3 = 66
        verify(userRepository).findByUsername("testuser");
    }

    @Test
    void getKpiUserTasks_WithNoPlannedTasks_ReturnsZeroEfficiency() {
        // Arrange
        Task task1 = Task.builder().status("cancelled").build();
        List<Task> tasks = Arrays.asList(task1);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(taskRepository.findByAssignedToId(1L)).thenReturn(tasks);

        // Act
        Map<String, Integer> result = taskService.getKpiUserTasks("testuser");

        // Assert
        assertNotNull(result);
        assertEquals(0, result.get("totalPlannedTasks"));
        assertEquals(0, result.get("totalDoneTasks"));
        assertEquals(0, result.get("efficiency"));
    }

    @Test
    void getKpiTotals_CalculatesCorrectly() {
        // Arrange
        Task task1 = Task.builder()
                .estimatedHours(15)
                .effortHours(12)
                .build();

        Task task2 = Task.builder()
                .estimatedHours(25)
                .effortHours(20)
                .build();

        List<Task> tasks = Arrays.asList(task1, task2);
        when(taskRepository.findAll()).thenReturn(tasks);

        // Act
        Map<String, Double> result = taskService.getKpiTotals();

        // Assert
        assertNotNull(result);
        assertEquals(40.0, result.get("totalEstimatedHours")); // 15 + 25
        assertEquals(32.0, result.get("totalEffortHours")); // 12 + 20
        assertEquals(80.0, result.get("efficiency")); // (32/40) * 100
        verify(taskRepository).findAll();
    }

    @Test
    void getKpiTotals_WithNoTasks_ReturnsZeroValues() {
        // Arrange
        when(taskRepository.findAll()).thenReturn(new ArrayList<>());

        // Act
        Map<String, Double> result = taskService.getKpiTotals();

        // Assert
        assertNotNull(result);
        assertEquals(0.0, result.get("totalEstimatedHours"));
        assertEquals(0.0, result.get("totalEffortHours"));
        assertEquals(0.0, result.get("efficiency"));
    }
}
