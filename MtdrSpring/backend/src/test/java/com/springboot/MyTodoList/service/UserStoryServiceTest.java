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

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.springboot.MyTodoList.model.AppUser;
import com.springboot.MyTodoList.model.Team;
import com.springboot.MyTodoList.model.UserStory;
import com.springboot.MyTodoList.repository.AppUserRepository;
import com.springboot.MyTodoList.repository.TeamRepository;
import com.springboot.MyTodoList.repository.UserStoryRepository;

@ExtendWith(MockitoExtension.class)
class UserStoryServiceTest {

    @Mock
    private UserStoryRepository storyRepository;

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private AppUserRepository userRepository;

    @InjectMocks
    private UserStoryService userStoryService;

    private UserStory testStory;
    private Team testTeam;
    private AppUser testUser;

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

        // Setup test story
        testStory = new UserStory();
        testStory.setId(1L);
        testStory.setTitle("Test User Story");
        testStory.setDescription("Test Description");
        testStory.setStoryPoints(5);
        testStory.setEstimatedHours(10);
        testStory.setPriority("high");
        testStory.setStatus("backlog");
        testStory.setTeam(testTeam);
        testStory.setCreatedBy(testUser);
    }

    @Test
    void createStory_Success() {
        // Arrange
        UserStory newStory = new UserStory();
        newStory.setTitle("New Story");
        newStory.setDescription("New Description");

        when(teamRepository.findById(1L)).thenReturn(Optional.of(testTeam));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(storyRepository.save(any(UserStory.class))).thenReturn(testStory);

        // Act
        UserStory result = userStoryService.createStory(newStory, 1L, 1L);

        // Assert
        assertNotNull(result);
        assertEquals(testStory.getTitle(), result.getTitle());
        verify(teamRepository).findById(1L);
        verify(userRepository).findById(1L);
        verify(storyRepository).save(newStory);
        assertEquals(testTeam, newStory.getTeam());
        assertEquals(testUser, newStory.getCreatedBy());
    }

    @Test
    void createStory_TeamNotFound_ThrowsException() {
        // Arrange
        UserStory newStory = new UserStory();
        when(teamRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userStoryService.createStory(newStory, 1L, 1L);
        });

        assertEquals("Team not found", exception.getMessage());
        verify(teamRepository).findById(1L);
        verify(userRepository, never()).findById(anyLong());
        verify(storyRepository, never()).save(any());
    }

    @Test
    void createStory_UserNotFound_ThrowsException() {
        // Arrange
        UserStory newStory = new UserStory();
        when(teamRepository.findById(1L)).thenReturn(Optional.of(testTeam));
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userStoryService.createStory(newStory, 1L, 1L);
        });

        assertEquals("User not found", exception.getMessage());
        verify(teamRepository).findById(1L);
        verify(userRepository).findById(1L);
        verify(storyRepository, never()).save(any());
    }

    @Test
    void getStoryById_Found() {
        // Arrange
        when(storyRepository.findById(1L)).thenReturn(Optional.of(testStory));

        // Act
        Optional<UserStory> result = userStoryService.getStoryById(1L);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testStory.getId(), result.get().getId());
        assertEquals(testStory.getTitle(), result.get().getTitle());
        verify(storyRepository).findById(1L);
    }

    @Test
    void getStoryById_NotFound() {
        // Arrange
        when(storyRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act
        Optional<UserStory> result = userStoryService.getStoryById(999L);

        // Assert
        assertFalse(result.isPresent());
        verify(storyRepository).findById(999L);
    }

    @Test
    void getAllStories_ReturnsAllStories() {
        // Arrange
        UserStory story2 = new UserStory();
        story2.setId(2L);
        story2.setTitle("Story 2");

        List<UserStory> stories = Arrays.asList(testStory, story2);
        when(storyRepository.findAll()).thenReturn(stories);

        // Act
        List<UserStory> result = userStoryService.getAllStories();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(testStory.getTitle(), result.get(0).getTitle());
        assertEquals(story2.getTitle(), result.get(1).getTitle());
        verify(storyRepository).findAll();
    }

    @Test
    void getStoriesByTeam_ReturnsTeamStories() {
        // Arrange
        List<UserStory> stories = Arrays.asList(testStory);
        when(storyRepository.findByTeamId(1L)).thenReturn(stories);

        // Act
        List<UserStory> result = userStoryService.getStoriesByTeam(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testStory.getId(), result.get(0).getId());
        verify(storyRepository).findByTeamId(1L);
    }

    @Test
    void getStoriesByTeamAndStatus_ReturnsFilteredStories() {
        // Arrange
        List<UserStory> backlogStories = Arrays.asList(testStory);
        when(storyRepository.findByTeamIdAndStatus(1L, "backlog")).thenReturn(backlogStories);

        // Act
        List<UserStory> result = userStoryService.getStoriesByTeamAndStatus(1L, "backlog");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("backlog", result.get(0).getStatus());
        verify(storyRepository).findByTeamIdAndStatus(1L, "backlog");
    }

    @Test
    void getStoriesByTeamOrderedByPriority_ReturnsOrderedStories() {
        // Arrange
        UserStory story2 = new UserStory();
        story2.setId(2L);
        story2.setTitle("High Priority Story");
        story2.setPriority("critical");

        List<UserStory> orderedStories = Arrays.asList(story2, testStory);
        when(storyRepository.findByTeamIdOrderByPriority(1L)).thenReturn(orderedStories);

        // Act
        List<UserStory> result = userStoryService.getStoriesByTeamOrderedByPriority(1L);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("critical", result.get(0).getPriority());
        assertEquals("high", result.get(1).getPriority());
        verify(storyRepository).findByTeamIdOrderByPriority(1L);
    }

    @Test
    void updateStory_Success() {
        // Arrange
        UserStory updatedDetails = new UserStory();
        updatedDetails.setTitle("Updated Title");
        updatedDetails.setDescription("Updated Description");
        updatedDetails.setStoryPoints(8);
        updatedDetails.setEstimatedHours(20);
        updatedDetails.setPriority("medium");
        updatedDetails.setStatus("in_progress");

        when(storyRepository.findById(1L)).thenReturn(Optional.of(testStory));
        when(storyRepository.save(any(UserStory.class))).thenReturn(testStory);

        // Act
        UserStory result = userStoryService.updateStory(1L, updatedDetails);

        // Assert
        assertNotNull(result);
        assertEquals("Updated Title", testStory.getTitle());
        assertEquals("Updated Description", testStory.getDescription());
        assertEquals(8, testStory.getStoryPoints());
        assertEquals(20, testStory.getEstimatedHours());
        assertEquals("medium", testStory.getPriority());
        assertEquals("in_progress", testStory.getStatus());
        verify(storyRepository).findById(1L);
        verify(storyRepository).save(testStory);
    }

    @Test
    void updateStory_NotFound_ThrowsException() {
        // Arrange
        UserStory updatedDetails = new UserStory();
        when(storyRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userStoryService.updateStory(999L, updatedDetails);
        });

        assertEquals("Story not found", exception.getMessage());
        verify(storyRepository).findById(999L);
        verify(storyRepository, never()).save(any());
    }

    @Test
    void updateStoryStatus_Success() {
        // Arrange
        when(storyRepository.findById(1L)).thenReturn(Optional.of(testStory));
        when(storyRepository.save(any(UserStory.class))).thenReturn(testStory);

        // Act
        UserStory result = userStoryService.updateStoryStatus(1L, "done");

        // Assert
        assertNotNull(result);
        assertEquals("done", testStory.getStatus());
        verify(storyRepository).findById(1L);
        verify(storyRepository).save(testStory);
    }

    @Test
    void updateStoryStatus_NotFound_ThrowsException() {
        // Arrange
        when(storyRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userStoryService.updateStoryStatus(999L, "done");
        });

        assertEquals("Story not found", exception.getMessage());
        verify(storyRepository).findById(999L);
        verify(storyRepository, never()).save(any());
    }

    @Test
    void deleteStory_Success() {
        // Arrange
        doNothing().when(storyRepository).deleteById(1L);

        // Act
        userStoryService.deleteStory(1L);

        // Assert
        verify(storyRepository).deleteById(1L);
    }

    @Test
    void searchStoriesByTitle_ReturnsMatchingStories() {
        // Arrange
        UserStory story2 = new UserStory();
        story2.setId(2L);
        story2.setTitle("Test Another Story");

        List<UserStory> matchingStories = Arrays.asList(testStory, story2);
        when(storyRepository.searchByTitle("Test")).thenReturn(matchingStories);

        // Act
        List<UserStory> result = userStoryService.searchStoriesByTitle("Test");

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertTrue(result.get(0).getTitle().contains("Test"));
        assertTrue(result.get(1).getTitle().contains("Test"));
        verify(storyRepository).searchByTitle("Test");
    }
}
