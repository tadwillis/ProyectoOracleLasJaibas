package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.client.LLMClient;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.springboot.MyTodoList.model.AppUser;
import com.springboot.MyTodoList.model.Task;
import com.springboot.MyTodoList.repository.TaskRepository;
import com.springboot.MyTodoList.service.TaskService;

@ExtendWith(MockitoExtension.class)
class TaskControllerTest {

        private MockMvc mockMvc;

        private ObjectMapper objectMapper;

        @Mock
        private TaskService taskService;

        @Mock
        private TaskRepository taskRepository;

        @Mock
        private LLMClient llmClient;

        @InjectMocks
        private TaskController taskController;

        private Task testTask;
        private AppUser testUser;

        @BeforeEach
        void setUp() {
                // Initialize MockMvc
                mockMvc = MockMvcBuilders.standaloneSetup(taskController).build();
                objectMapper = new ObjectMapper();

                // Setup test user
                testUser = new AppUser();
                testUser.setId(1L);
                testUser.setUsername("testuser");
                testUser.setFullName("Test User");

                // Setup test task
                testTask = Task.builder()
                                .id(1L)
                                .title("Test Task")
                                .description("Test Description")
                                .status("todo")
                                .priority(1)
                                .estimatedHours(8)
                                .effortHours(6)
                                .assignedTo(testUser)
                                .build();
        }

        @Test
        void createTask_Success() throws Exception {
                // Arrange
                when(taskService.createTask(any(Task.class), eq(1L), eq(1L)))
                                .thenReturn(testTask);

                Task newTask = Task.builder()
                                .title("New Task")
                                .description("New Description")
                                .build();

                // Act & Assert
                mockMvc.perform(post("/api/tasks")
                                .contentType(MediaType.APPLICATION_JSON)
                                .param("storyId", "1")
                                .param("teamId", "1")
                                .content(objectMapper.writeValueAsString(newTask)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.id").value(1))
                                .andExpect(jsonPath("$.title").value("Test Task"))
                                .andExpect(jsonPath("$.description").value("Test Description"));

                verify(taskService).createTask(any(Task.class), eq(1L), eq(1L));
        }

        @Test
        void getTaskById_Found() throws Exception {
                // Arrange
                when(taskService.getTaskById(1L)).thenReturn(Optional.of(testTask));

                // Act & Assert
                mockMvc.perform(get("/api/tasks/1"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value(1))
                                .andExpect(jsonPath("$.title").value("Test Task"))
                                .andExpect(jsonPath("$.status").value("todo"));

                verify(taskService).getTaskById(1L);
        }

        @Test
        void getTaskById_NotFound() throws Exception {
                // Arrange
                when(taskService.getTaskById(999L)).thenReturn(Optional.empty());

                // Act & Assert
                mockMvc.perform(get("/api/tasks/999"))
                                .andExpect(status().isNotFound());

                verify(taskService).getTaskById(999L);
        }

        @Test
        void getAllTasks_ReturnsTaskList() throws Exception {
                // Arrange
                Task task2 = Task.builder()
                                .id(2L)
                                .title("Task 2")
                                .build();

                List<Task> tasks = Arrays.asList(testTask, task2);
                when(taskService.getAllTasks()).thenReturn(tasks);

                // Act & Assert
                mockMvc.perform(get("/api/tasks"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.length()").value(2))
                                .andExpect(jsonPath("$[0].id").value(1))
                                .andExpect(jsonPath("$[0].title").value("Test Task"))
                                .andExpect(jsonPath("$[1].id").value(2))
                                .andExpect(jsonPath("$[1].title").value("Task 2"));

                verify(taskService).getAllTasks();
        }

        @Test
        void getTasksByStory_ReturnsStoryTasks() throws Exception {
                // Arrange
                List<Task> tasks = Arrays.asList(testTask);
                when(taskService.getTasksByStory(1L)).thenReturn(tasks);

                // Act & Assert
                mockMvc.perform(get("/api/tasks/story/1"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.length()").value(1))
                                .andExpect(jsonPath("$[0].id").value(1));

                verify(taskService).getTasksByStory(1L);
        }

        @Test
        void getTasksBySprint_ReturnsSprintTasks() throws Exception {
                // Arrange
                List<Task> tasks = Arrays.asList(testTask);
                when(taskService.getTasksBySprint(1L)).thenReturn(tasks);

                // Act & Assert
                mockMvc.perform(get("/api/tasks/sprint/1"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.length()").value(1))
                                .andExpect(jsonPath("$[0].id").value(1));

                verify(taskService).getTasksBySprint(1L);
        }

        @Test
        void getTasksByTeam_ReturnsTeamTasks() throws Exception {
                // Arrange
                List<Task> tasks = Arrays.asList(testTask);
                when(taskService.getTasksByTeam(1L)).thenReturn(tasks);

                // Act & Assert
                mockMvc.perform(get("/api/tasks/team/1"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.length()").value(1))
                                .andExpect(jsonPath("$[0].id").value(1));

                verify(taskService).getTasksByTeam(1L);
        }

        @Test
        void getTasksByAssignedUser_ReturnsUserTasks() throws Exception {
                // Arrange
                List<Task> tasks = Arrays.asList(testTask);
                when(taskService.getTasksByAssignedUser(1L)).thenReturn(tasks);

                // Act & Assert
                mockMvc.perform(get("/api/tasks/user/1"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.length()").value(1))
                                .andExpect(jsonPath("$[0].id").value(1));

                verify(taskService).getTasksByAssignedUser(1L);
        }

        @Test
        void getTasksByUserAndStatus_ReturnsFilteredTasks() throws Exception {
                // Arrange
                List<Task> tasks = Arrays.asList(testTask);
                when(taskService.getTasksByUserAndStatus(1L, "done")).thenReturn(tasks);

                // Act & Assert
                mockMvc.perform(get("/api/tasks/user/1/status/done"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.length()").value(1))
                                .andExpect(jsonPath("$[0].status").value("todo"));

                verify(taskService).getTasksByUserAndStatus(1L, "done");
        }

        @Test
        void getTasksByAssignedUsername_ReturnsUserTasks() throws Exception {
                // Arrange
                List<Task> tasks = Arrays.asList(testTask);
                when(taskService.getTasksByAssignedUsername("testuser")).thenReturn(tasks);

                // Act & Assert
                mockMvc.perform(get("/api/tasks/username/testuser"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.length()").value(1))
                                .andExpect(jsonPath("$[0].id").value(1));

                verify(taskService).getTasksByAssignedUsername("testuser");
        }

        @Test
        void getKpiHours_ReturnsKpiData() throws Exception {
                // Arrange
                Map<String, Double> kpiData = new HashMap<>();
                kpiData.put("totalEstimatedHours", 100.0);
                kpiData.put("totalEffortHours", 80.0);
                kpiData.put("efficiency", 80.0);

                when(taskService.getKpiTotals()).thenReturn(kpiData);

                // Act & Assert
                mockMvc.perform(get("/api/tasks/kpi/hours"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.totalEstimatedHours").value(100.0))
                                .andExpect(jsonPath("$.totalEffortHours").value(80.0))
                                .andExpect(jsonPath("$.efficiency").value(80.0));

                verify(taskService).getKpiTotals();
        }

        @Test
        void getKpiUserHours_ReturnsUserKpiData() throws Exception {
                // Arrange
                Map<String, Double> kpiData = new HashMap<>();
                kpiData.put("totalEstimatedHours", 40.0);
                kpiData.put("totalEffortHours", 35.0);
                kpiData.put("efficiency", 87.5);

                when(taskService.getKpiUserHours("testuser")).thenReturn(kpiData);

                // Act & Assert
                mockMvc.perform(get("/api/tasks/kpiUser/hours/testuser"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.totalEstimatedHours").value(40.0))
                                .andExpect(jsonPath("$.totalEffortHours").value(35.0))
                                .andExpect(jsonPath("$.efficiency").value(87.5));

                verify(taskService).getKpiUserHours("testuser");
        }

        @Test
        void getKpiUserTasks_ReturnsUserTaskKpiData() throws Exception {
                // Arrange
                Map<String, Integer> kpiData = new HashMap<>();
                kpiData.put("totalPlannedTasks", 10);
                kpiData.put("totalDoneTasks", 8);
                kpiData.put("efficiency", 80);

                when(taskService.getKpiUserTasks("testuser")).thenReturn(kpiData);

                // Act & Assert
                mockMvc.perform(get("/api/tasks/kpiUser/tasks/testuser"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.totalPlannedTasks").value(10))
                                .andExpect(jsonPath("$.totalDoneTasks").value(8))
                                .andExpect(jsonPath("$.efficiency").value(80));

                verify(taskService).getKpiUserTasks("testuser");
        }

        @Test
        void getTasksBySprintWithUser_ReturnsDoneTasks() throws Exception {
                // Arrange
                testTask.setStatus("done");
                List<Task> tasks = Arrays.asList(testTask);
                when(taskRepository.findBySprintIdAndStatus(1L, "done")).thenReturn(tasks);

                // Act & Assert
                mockMvc.perform(get("/api/tasks/kpiTeam/sprint/1"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.length()").value(1))
                                .andExpect(jsonPath("$[0].user").value("Test User"))
                                .andExpect(jsonPath("$[0].task").value("Test Task"));

                verify(taskRepository).findBySprintIdAndStatus(1L, "done");
        }

        @Test
        void getTasksBySprintWithUser_HandlesNullUser() throws Exception {
                // Arrange
                Task taskWithoutUser = Task.builder()
                                .id(2L)
                                .title("Unassigned Task")
                                .status("done")
                                .assignedTo(null)
                                .build();

                List<Task> tasks = Arrays.asList(taskWithoutUser);
                when(taskRepository.findBySprintIdAndStatus(1L, "done")).thenReturn(tasks);

                // Act & Assert
                mockMvc.perform(get("/api/tasks/kpiTeam/sprint/1"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.length()").value(1))
                                .andExpect(jsonPath("$[0].user").value("-"))
                                .andExpect(jsonPath("$[0].task").value("Unassigned Task"));

                verify(taskRepository).findBySprintIdAndStatus(1L, "done");
        }

        @Test
        void updateTask_Success() throws Exception {
                // Arrange
                Task updatedTask = Task.builder()
                                .id(1L)
                                .title("Updated Task")
                                .description("Updated Description")
                                .status("in_progress")
                                .build();

                when(taskService.updateTask(eq(1L), any(Task.class))).thenReturn(updatedTask);

                // Act & Assert
                mockMvc.perform(put("/api/tasks/1")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updatedTask)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.title").value("Updated Task"))
                                .andExpect(jsonPath("$.description").value("Updated Description"))
                                .andExpect(jsonPath("$.status").value("in_progress"));

                verify(taskService).updateTask(eq(1L), any(Task.class));
        }

        @Test
        void updateTask_NotFound() throws Exception {
                // Arrange
                Task updatedTask = Task.builder().title("Updated").build();
                when(taskService.updateTask(eq(999L), any(Task.class)))
                                .thenThrow(new RuntimeException("Task not found"));

                // Act & Assert
                mockMvc.perform(put("/api/tasks/999")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updatedTask)))
                                .andExpect(status().isNotFound());

                verify(taskService).updateTask(eq(999L), any(Task.class));
        }

        @Test
        void assignTask_Success() throws Exception {
                // Arrange
                when(taskService.assignTask(1L, 1L)).thenReturn(testTask);

                // Act & Assert
                mockMvc.perform(patch("/api/tasks/1/assign")
                                .param("userId", "1"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value(1))
                                .andExpect(jsonPath("$.title").value("Test Task"));

                verify(taskService).assignTask(1L, 1L);
        }

        @Test
        void assignTask_NotFound() throws Exception {
                // Arrange
                when(taskService.assignTask(999L, 1L))
                                .thenThrow(new RuntimeException("Task not found"));

                // Act & Assert
                mockMvc.perform(patch("/api/tasks/999/assign")
                                .param("userId", "1"))
                                .andExpect(status().isNotFound());

                verify(taskService).assignTask(999L, 1L);
        }

        @Test
        void updateTaskStatus_Success() throws Exception {
                // Arrange
                Task updatedTask = Task.builder()
                                .id(1L)
                                .title("Test Task")
                                .status("done")
                                .build();

                when(taskService.updateTaskStatus(1L, "done")).thenReturn(updatedTask);

                // Act & Assert
                mockMvc.perform(patch("/api/tasks/1/status")
                                .param("status", "done"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value(1))
                                .andExpect(jsonPath("$.status").value("done"));

                verify(taskService).updateTaskStatus(1L, "done");
        }

        @Test
        void updateTaskStatus_NotFound() throws Exception {
                // Arrange
                when(taskService.updateTaskStatus(999L, "done"))
                                .thenThrow(new RuntimeException("Task not found"));

                // Act & Assert
                mockMvc.perform(patch("/api/tasks/999/status")
                                .param("status", "done"))
                                .andExpect(status().isNotFound());

                verify(taskService).updateTaskStatus(999L, "done");
        }

        @Test
        void deleteTask_Success() throws Exception {
                // Arrange
                doNothing().when(taskService).deleteTask(1L);

                // Act & Assert
                mockMvc.perform(delete("/api/tasks/1"))
                                .andExpect(status().isNoContent());

                verify(taskService).deleteTask(1L);
        }
}
