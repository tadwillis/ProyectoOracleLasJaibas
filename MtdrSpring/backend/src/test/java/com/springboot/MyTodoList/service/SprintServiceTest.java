package com.springboot.MyTodoList.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.springboot.MyTodoList.dto.SprintHoursDTO;
import com.springboot.MyTodoList.model.AppUser;
import com.springboot.MyTodoList.model.Project;
import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.repository.AppUserRepository;
import com.springboot.MyTodoList.repository.ProjectRepository;
import com.springboot.MyTodoList.repository.SprintRepository;
import com.springboot.MyTodoList.repository.TaskRepository;
import com.springboot.MyTodoList.repository.TeamRepository;

@ExtendWith(MockitoExtension.class)
class SprintServiceTest {

    @Mock
    private SprintRepository sprintRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private AppUserRepository userRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private TeamRepository teamRepository;

    @InjectMocks
    private SprintService sprintService;

    private Sprint testSprint;
    private Project testProject;
    private AppUser testUser;

    @BeforeEach
    void setUp() {
        // Setup test data
        testProject = new Project();
        testProject.setId(1L);
        testProject.setName("Test Project");

        testUser = new AppUser();
        testUser.setId(1L);
        testUser.setUsername("testuser");

        testSprint = new Sprint();
        testSprint.setId(1L);
        testSprint.setName("Sprint 1");
        testSprint.setGoal("Complete feature X");
        testSprint.setStartDate(LocalDate.now());
        testSprint.setEndDate(LocalDate.now().plusWeeks(2));
        testSprint.setStatus("active");
        testSprint.setProject(testProject);
        testSprint.setCreatedBy(testUser);
    }

    @Test
    void createSprint_Success() {
        // Arrange
        Sprint newSprint = new Sprint();
        newSprint.setName("New Sprint");
        newSprint.setGoal("New Goal");

        when(projectRepository.findById(1L)).thenReturn(Optional.of(testProject));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(sprintRepository.save(any(Sprint.class))).thenReturn(testSprint);

        // Act
        Sprint result = sprintService.createSprint(newSprint, 1L, 1L);

        // Assert
        assertNotNull(result);
        assertEquals(testSprint.getName(), result.getName());
        verify(projectRepository).findById(1L);
        verify(userRepository).findById(1L);
        verify(sprintRepository).save(newSprint);
        assertEquals(testProject, newSprint.getProject());
        assertEquals(testUser, newSprint.getCreatedBy());
    }

    @Test
    void createSprint_ProjectNotFound_ThrowsException() {
        // Arrange
        Sprint newSprint = new Sprint();
        when(projectRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            sprintService.createSprint(newSprint, 1L, 1L);
        });

        assertEquals("Project not found", exception.getMessage());
        verify(projectRepository).findById(1L);
        verify(userRepository, never()).findById(anyLong());
        verify(sprintRepository, never()).save(any());
    }

    @Test
    void createSprint_UserNotFound_ThrowsException() {
        // Arrange
        Sprint newSprint = new Sprint();
        when(projectRepository.findById(1L)).thenReturn(Optional.of(testProject));
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            sprintService.createSprint(newSprint, 1L, 1L);
        });

        assertEquals("User not found", exception.getMessage());
        verify(projectRepository).findById(1L);
        verify(userRepository).findById(1L);
        verify(sprintRepository, never()).save(any());
    }

    @Test
    void getSprintById_Found() {
        // Arrange
        when(sprintRepository.findById(1L)).thenReturn(Optional.of(testSprint));

        // Act
        Optional<Sprint> result = sprintService.getSprintById(1L);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testSprint.getId(), result.get().getId());
        assertEquals(testSprint.getName(), result.get().getName());
        verify(sprintRepository).findById(1L);
    }

    @Test
    void getSprintById_NotFound() {
        // Arrange
        when(sprintRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act
        Optional<Sprint> result = sprintService.getSprintById(999L);

        // Assert
        assertFalse(result.isPresent());
        verify(sprintRepository).findById(999L);
    }

    @Test
    void getAllSprints_ReturnsAllSprints() {
        // Arrange
        Sprint sprint2 = new Sprint();
        sprint2.setId(2L);
        sprint2.setName("Sprint 2");

        List<Sprint> sprints = Arrays.asList(testSprint, sprint2);
        when(sprintRepository.findAll()).thenReturn(sprints);

        // Act
        List<Sprint> result = sprintService.getAllSprints();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(testSprint.getName(), result.get(0).getName());
        assertEquals(sprint2.getName(), result.get(1).getName());
        verify(sprintRepository).findAll();
    }

    @Test
    void getSprintsByProject_ReturnsProjectSprints() {
        // Arrange
        List<Sprint> sprints = Arrays.asList(testSprint);
        when(sprintRepository.findByProjectId(1L)).thenReturn(sprints);

        // Act
        List<Sprint> result = sprintService.getSprintsByProject(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testSprint.getId(), result.get(0).getId());
        verify(sprintRepository).findByProjectId(1L);
    }

    @Test
    void getSprintsByStatus_ReturnsSprintsWithStatus() {
        // Arrange
        List<Sprint> activeSprints = Arrays.asList(testSprint);
        when(sprintRepository.findByStatus("active")).thenReturn(activeSprints);

        // Act
        List<Sprint> result = sprintService.getSprintsByStatus("active");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("active", result.get(0).getStatus());
        verify(sprintRepository).findByStatus("active");
    }

    @Test
    void getActiveSprintsByTeam_ReturnsActiveSprints() {
        // Arrange
        List<Sprint> activeSprints = Arrays.asList(testSprint);
        when(sprintRepository.findActiveSprintsByTeamId(1L)).thenReturn(activeSprints);

        // Act
        List<Sprint> result = sprintService.getActiveSprintsByTeam(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(sprintRepository).findActiveSprintsByTeamId(1L);
    }

    @Test
    void updateSprint_Success() {
        // Arrange
        Sprint updatedDetails = new Sprint();
        updatedDetails.setName("Updated Sprint");
        updatedDetails.setGoal("Updated Goal");
        updatedDetails.setStartDate(LocalDate.now().plusDays(1));
        updatedDetails.setEndDate(LocalDate.now().plusWeeks(3));
        updatedDetails.setStatus("completed");

        when(sprintRepository.findById(1L)).thenReturn(Optional.of(testSprint));
        when(sprintRepository.save(any(Sprint.class))).thenReturn(testSprint);

        // Act
        Sprint result = sprintService.updateSprint(1L, updatedDetails);

        // Assert
        assertNotNull(result);
        assertEquals("Updated Sprint", testSprint.getName());
        assertEquals("Updated Goal", testSprint.getGoal());
        assertEquals("completed", testSprint.getStatus());
        verify(sprintRepository).findById(1L);
        verify(sprintRepository).save(testSprint);
    }

    @Test
    void updateSprint_NotFound_ThrowsException() {
        // Arrange
        Sprint updatedDetails = new Sprint();
        when(sprintRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            sprintService.updateSprint(999L, updatedDetails);
        });

        assertEquals("Sprint not found", exception.getMessage());
        verify(sprintRepository).findById(999L);
        verify(sprintRepository, never()).save(any());
    }

    @Test
    void updateSprintStatus_Success() {
        // Arrange
        when(sprintRepository.findById(1L)).thenReturn(Optional.of(testSprint));
        when(sprintRepository.save(any(Sprint.class))).thenReturn(testSprint);

        // Act
        Sprint result = sprintService.updateSprintStatus(1L, "completed");

        // Assert
        assertNotNull(result);
        assertEquals("completed", testSprint.getStatus());
        verify(sprintRepository).findById(1L);
        verify(sprintRepository).save(testSprint);
    }

    @Test
    void updateSprintStatus_NotFound_ThrowsException() {
        // Arrange
        when(sprintRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            sprintService.updateSprintStatus(999L, "completed");
        });

        assertEquals("Sprint not found", exception.getMessage());
        verify(sprintRepository).findById(999L);
        verify(sprintRepository, never()).save(any());
    }

    @Test
    void deleteSprint_Success() {
        // Arrange
        doNothing().when(sprintRepository).deleteById(1L);

        // Act
        sprintService.deleteSprint(1L);

        // Assert
        verify(sprintRepository).deleteById(1L);
    }

    @Test
    void getGlobalSprintHoursByProject_ReturnsHoursPerSprint() {
        // Arrange
        Sprint sprint2 = new Sprint();
        sprint2.setId(2L);
        sprint2.setName("Sprint 2");

        List<Sprint> sprints = Arrays.asList(testSprint, sprint2);
        when(sprintRepository.findByProjectId(1L)).thenReturn(sprints);
        when(taskRepository.getTotalHoursBySprint(1L)).thenReturn(40.0);
        when(taskRepository.getTotalHoursBySprint(2L)).thenReturn(null); // Test null handling

        // Act
        List<SprintHoursDTO> result = sprintService.getGlobalSprintHoursByProject(1L);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());

        SprintHoursDTO firstDTO = result.get(0);
        assertEquals(1L, firstDTO.getSprintId());
        assertEquals("Sprint 1", firstDTO.getSprintName());
        assertEquals(40.0, firstDTO.getTotalHours());

        SprintHoursDTO secondDTO = result.get(1);
        assertEquals(2L, secondDTO.getSprintId());
        assertEquals("Sprint 2", secondDTO.getSprintName());
        assertEquals(0.0, secondDTO.getTotalHours()); // Should default to 0.0

        verify(sprintRepository).findByProjectId(1L);
        verify(taskRepository).getTotalHoursBySprint(1L);
        verify(taskRepository).getTotalHoursBySprint(2L);
    }

    @Test
    void getSprintHoursByProject_ReturnsUserHoursPerSprint() {
        // Arrange
        Sprint sprint2 = new Sprint();
        sprint2.setId(2L);
        sprint2.setName("Sprint 2");

        List<Sprint> sprints = Arrays.asList(testSprint, sprint2);
        when(sprintRepository.findByProjectId(1L)).thenReturn(sprints);
        when(taskRepository.getUserDoneHoursBySprint(1L, "testuser")).thenReturn(25.0);
        when(taskRepository.getUserDoneHoursBySprint(2L, "testuser")).thenReturn(15.0);

        // Act
        List<SprintHoursDTO> result = sprintService.getSprintHoursByProject(1L, "testuser");

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());

        SprintHoursDTO firstDTO = result.get(0);
        assertEquals(1L, firstDTO.getSprintId());
        assertEquals("Sprint 1", firstDTO.getSprintName());
        assertEquals(25.0, firstDTO.getTotalHours());

        SprintHoursDTO secondDTO = result.get(1);
        assertEquals(2L, secondDTO.getSprintId());
        assertEquals("Sprint 2", secondDTO.getSprintName());
        assertEquals(15.0, secondDTO.getTotalHours());

        verify(sprintRepository).findByProjectId(1L);
        verify(taskRepository).getUserDoneHoursBySprint(1L, "testuser");
        verify(taskRepository).getUserDoneHoursBySprint(2L, "testuser");
    }

    @Test
    void getSprintHoursByProject_WithNullHours_DefaultsToZero() {
        // Arrange
        List<Sprint> sprints = Arrays.asList(testSprint);
        when(sprintRepository.findByProjectId(1L)).thenReturn(sprints);
        when(taskRepository.getUserDoneHoursBySprint(1L, "testuser")).thenReturn(null);

        // Act
        List<SprintHoursDTO> result = sprintService.getSprintHoursByProject(1L, "testuser");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(0.0, result.get(0).getTotalHours());
        verify(taskRepository).getUserDoneHoursBySprint(1L, "testuser");
    }
}
