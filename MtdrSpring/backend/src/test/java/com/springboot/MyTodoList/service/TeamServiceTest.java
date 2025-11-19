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
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.springboot.MyTodoList.model.AppUser;
import com.springboot.MyTodoList.model.Team;
import com.springboot.MyTodoList.model.TeamMember;
import com.springboot.MyTodoList.repository.AppUserRepository;
import com.springboot.MyTodoList.repository.TeamMemberRepository;
import com.springboot.MyTodoList.repository.TeamRepository;

@ExtendWith(MockitoExtension.class)
class TeamServiceTest {

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private TeamMemberRepository teamMemberRepository;

    @Mock
    private AppUserRepository userRepository;

    @InjectMocks
    private TeamService teamService;

    private Team testTeam;
    private AppUser testUser;

    @BeforeEach
    void setUp() {
        // Setup test user
        testUser = new AppUser();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setFullName("Test User");

        // Setup test team
        testTeam = new Team();
        testTeam.setId(1L);
        testTeam.setName("Test Team");
        testTeam.setDescription("Test Description");
        testTeam.setCreatedBy(testUser);
    }

    @Test
    void createTeam_Success() {
        // Arrange
        Team newTeam = new Team();
        newTeam.setName("New Team");
        newTeam.setDescription("New Description");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(teamRepository.save(any(Team.class))).thenReturn(testTeam);
        when(teamMemberRepository.save(any(TeamMember.class))).thenReturn(new TeamMember());

        // Act
        Team result = teamService.createTeam(newTeam, 1L);

        // Assert
        assertNotNull(result);
        assertEquals(testTeam.getName(), result.getName());
        verify(userRepository).findById(1L);
        verify(teamRepository).save(newTeam);
        verify(teamMemberRepository).save(any(TeamMember.class));
        assertEquals(testUser, newTeam.getCreatedBy());
    }

    @Test
    void createTeam_CreatesOwnerMembership() {
        // Arrange
        Team newTeam = new Team();
        newTeam.setName("New Team");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(teamRepository.save(any(Team.class))).thenReturn(testTeam);
        when(teamMemberRepository.save(any(TeamMember.class))).thenReturn(new TeamMember());

        // Act
        teamService.createTeam(newTeam, 1L);

        // Assert - Capture the TeamMember that was saved
        ArgumentCaptor<TeamMember> teamMemberCaptor = ArgumentCaptor.forClass(TeamMember.class);
        verify(teamMemberRepository).save(teamMemberCaptor.capture());

        TeamMember savedMember = teamMemberCaptor.getValue();
        assertEquals(testTeam, savedMember.getTeam());
        assertEquals(testUser, savedMember.getUser());
        assertEquals("owner", savedMember.getRole());
    }

    @Test
    void createTeam_UserNotFound_ThrowsException() {
        // Arrange
        Team newTeam = new Team();
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            teamService.createTeam(newTeam, 1L);
        });

        assertEquals("User not found", exception.getMessage());
        verify(userRepository).findById(1L);
        verify(teamRepository, never()).save(any());
        verify(teamMemberRepository, never()).save(any());
    }

    @Test
    void getTeamById_Found() {
        // Arrange
        when(teamRepository.findById(1L)).thenReturn(Optional.of(testTeam));

        // Act
        Optional<Team> result = teamService.getTeamById(1L);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testTeam.getId(), result.get().getId());
        assertEquals(testTeam.getName(), result.get().getName());
        verify(teamRepository).findById(1L);
    }

    @Test
    void getTeamById_NotFound() {
        // Arrange
        when(teamRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act
        Optional<Team> result = teamService.getTeamById(999L);

        // Assert
        assertFalse(result.isPresent());
        verify(teamRepository).findById(999L);
    }

    @Test
    void getAllTeams_ReturnsAllTeams() {
        // Arrange
        Team team2 = new Team();
        team2.setId(2L);
        team2.setName("Team 2");

        List<Team> teams = Arrays.asList(testTeam, team2);
        when(teamRepository.findAll()).thenReturn(teams);

        // Act
        List<Team> result = teamService.getAllTeams();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(testTeam.getName(), result.get(0).getName());
        assertEquals(team2.getName(), result.get(1).getName());
        verify(teamRepository).findAll();
    }

    @Test
    void getTeamsByUser_ReturnsUserTeams() {
        // Arrange
        List<Team> userTeams = Arrays.asList(testTeam);
        when(teamRepository.findTeamsByUserId(1L)).thenReturn(userTeams);

        // Act
        List<Team> result = teamService.getTeamsByUser(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testTeam.getId(), result.get(0).getId());
        verify(teamRepository).findTeamsByUserId(1L);
    }

    @Test
    void getTeamsByUser_ReturnsEmptyList_WhenUserHasNoTeams() {
        // Arrange
        when(teamRepository.findTeamsByUserId(anyLong())).thenReturn(Arrays.asList());

        // Act
        List<Team> result = teamService.getTeamsByUser(999L);

        // Assert
        assertNotNull(result);
        assertEquals(0, result.size());
        verify(teamRepository).findTeamsByUserId(999L);
    }

    @Test
    void updateTeam_Success() {
        // Arrange
        Team updatedDetails = new Team();
        updatedDetails.setName("Updated Team Name");
        updatedDetails.setDescription("Updated Description");

        when(teamRepository.findById(1L)).thenReturn(Optional.of(testTeam));
        when(teamRepository.save(any(Team.class))).thenReturn(testTeam);

        // Act
        Team result = teamService.updateTeam(1L, updatedDetails);

        // Assert
        assertNotNull(result);
        assertEquals("Updated Team Name", testTeam.getName());
        assertEquals("Updated Description", testTeam.getDescription());
        verify(teamRepository).findById(1L);
        verify(teamRepository).save(testTeam);
    }

    @Test
    void updateTeam_NotFound_ThrowsException() {
        // Arrange
        Team updatedDetails = new Team();
        when(teamRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            teamService.updateTeam(999L, updatedDetails);
        });

        assertEquals("Team not found", exception.getMessage());
        verify(teamRepository).findById(999L);
        verify(teamRepository, never()).save(any());
    }

    @Test
    void deleteTeam_Success() {
        // Arrange
        doNothing().when(teamRepository).deleteById(1L);

        // Act
        teamService.deleteTeam(1L);

        // Assert
        verify(teamRepository).deleteById(1L);
    }

    @Test
    void searchTeamsByName_ReturnsMatchingTeams() {
        // Arrange
        Team team2 = new Team();
        team2.setId(2L);
        team2.setName("Test Another Team");

        List<Team> matchingTeams = Arrays.asList(testTeam, team2);
        when(teamRepository.searchByName("Test")).thenReturn(matchingTeams);

        // Act
        List<Team> result = teamService.searchTeamsByName("Test");

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertTrue(result.get(0).getName().contains("Test"));
        assertTrue(result.get(1).getName().contains("Test"));
        verify(teamRepository).searchByName("Test");
    }

    @Test
    void searchTeamsByName_ReturnsEmptyList_WhenNoMatches() {
        // Arrange
        when(teamRepository.searchByName("NonExistent")).thenReturn(Arrays.asList());

        // Act
        List<Team> result = teamService.searchTeamsByName("NonExistent");

        // Assert
        assertNotNull(result);
        assertEquals(0, result.size());
        verify(teamRepository).searchByName("NonExistent");
    }
}
