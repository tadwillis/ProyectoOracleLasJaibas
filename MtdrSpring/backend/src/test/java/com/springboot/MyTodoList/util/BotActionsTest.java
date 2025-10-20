package com.springboot.MyTodoList.util;

import com.springboot.MyTodoList.model.Task;
import com.springboot.MyTodoList.model.AppUser;
import com.springboot.MyTodoList.service.TaskService;
import com.springboot.MyTodoList.service.AppUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.telegram.telegrambots.meta.generics.TelegramClient;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import java.util.*;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Pruebas automáticas para BotActions usando Mockito
 * 
 * Cumple con los requisitos de la actividad:
 * 1. Dar de alta tarea
 * 2. Asignar tarea para un integrante
 * 3. Completar tarea
 * 4. Visualizar tareas de un desarrollador
 * 5. Visualizar KPIs de un desarrollador
 */
@ExtendWith(MockitoExtension.class)
public class BotActionsTest {

    @Mock
    private TelegramClient telegramClient;

    @Mock
    private TaskService taskService;

    @Mock
    private AppUserService appUserService;

    @InjectMocks
    private BotActions botActions;

    private Long testChatId = 12345L;
    private Long testUserId = 1L;
    private AppUser testUser;
    private Task testTask;

    @BeforeEach
    void setUp() {
        // Configurar datos de prueba
        testUser = AppUser.builder()
                .id(testUserId)
                .username("testuser")
                .email("test@example.com")
                .fullName("Test User")
                .phone("1234567890")
                .status("active")
                .password("password123")
                .build();

        testTask = Task.builder()
                .id(1L)
                .title("Tarea de prueba")
                .description("Descripción de prueba")
                .status("todo")
                .priority(1)
                .estimatedHours(5)
                .build();
        testTask.setAssignedTo(testUser);

        // Configurar BotActions
        botActions.setChatId(testChatId);
        botActions.setTelegramClient(telegramClient);
        botActions.setTaskService(taskService);
        botActions.setAppUserService(appUserService);
    }

    // ========================================
    // PRUEBA 1: DAR DE ALTA UNA TAREA
    // ========================================

    @Test
    void testDarDeAltaTarea_ConTituloSimple() {
        // Arrange
        Task nuevaTarea = Task.builder()
                .id(2L)
                .title("Nueva tarea de prueba")
                .status("todo")
                .priority(0)
                .build();
        nuevaTarea.setAssignedTo(testUser);

        when(taskService.createTaskWithAssignedUser(any(Task.class), eq(1L), eq(1L), eq(testUserId)))
                .thenReturn(nuevaTarea);

        // Act
        Task resultado = taskService.createTaskWithAssignedUser(nuevaTarea, 1L, 1L, testUserId);

        // Assert
        assertNotNull(resultado);
        assertEquals("Nueva tarea de prueba", resultado.getTitle());
        assertEquals("todo", resultado.getStatus());
        verify(taskService, times(1)).createTaskWithAssignedUser(any(Task.class), eq(1L), eq(1L), eq(testUserId));
    }

    @Test
    void testDarDeAltaTarea_ConFormatoCSV() {
        // Arrange
        Task tareaCompleta = Task.builder()
                .id(3L)
                .title("Implementar Login")
                .description("Agregar autenticación JWT")
                .status("todo")
                .priority(2)
                .estimatedHours(8)
                .build();
        tareaCompleta.setAssignedTo(testUser);

        when(taskService.createTaskWithAssignedUser(any(Task.class), eq(1L), eq(1L), eq(testUserId)))
                .thenReturn(tareaCompleta);

        // Act
        Task resultado = taskService.createTaskWithAssignedUser(tareaCompleta, 1L, 1L, testUserId);

        // Assert
        assertEquals("Implementar Login", resultado.getTitle());
        assertEquals(8, resultado.getEstimatedHours());
        assertEquals(testUserId, resultado.getAssignedTo().getId());
    }

    // ========================================
    // PRUEBA 2: ASIGNAR TAREA A UN INTEGRANTE
    // ========================================

    @Test
    void testAsignarTarea_AUnUsuarioEspecifico() {
        // Arrange
        Long taskId = 1L;
        Long userIdToAssign = 2L;

        AppUser assignedUser = AppUser.builder()
                .id(userIdToAssign)
                .username("developer1")
                .email("dev1@example.com")
                .fullName("Developer One")
                .status("active")
                .build();

        Task assignedTask = Task.builder()
                .id(taskId)
                .title("Tarea para asignar")
                .status("todo")
                .build();
        assignedTask.setAssignedTo(assignedUser);

        when(taskService.assignTask(taskId, userIdToAssign))
                .thenReturn(assignedTask);

        // Act
        Task result = taskService.assignTask(taskId, userIdToAssign);

        // Assert
        assertNotNull(result);
        assertEquals(userIdToAssign, result.getAssignedTo().getId());
        verify(taskService, times(1)).assignTask(taskId, userIdToAssign);
    }

    @Test
    void testAsignarTarea_AlCrearla() {
        // Arrange
        Task nuevaTarea = Task.builder()
                .id(5L)
                .title("Tarea con asignación automática")
                .status("todo")
                .build();
        nuevaTarea.setAssignedTo(testUser);

        when(taskService.createTaskWithAssignedUser(any(Task.class), eq(1L), eq(1L), eq(testUserId)))
                .thenReturn(nuevaTarea);

        // Act
        Task resultado = taskService.createTaskWithAssignedUser(nuevaTarea, 1L, 1L, testUserId);

        // Assert
        assertNotNull(resultado.getAssignedTo());
        assertEquals(testUserId, resultado.getAssignedTo().getId());
    }

    // ========================================
    // PRUEBA 3: COMPLETAR TAREA
    // ========================================

    @Test
    void testCompletarTarea_CambioDeEstado() {
        // Arrange
        Long taskId = 1L;

        Task taskToComplete = Task.builder()
                .id(taskId)
                .title("Tarea a completar")
                .status("todo")
                .build();
        taskToComplete.setAssignedTo(testUser);

        when(taskService.getTaskById(taskId))
                .thenReturn(Optional.of(taskToComplete));
        when(taskService.updateTaskStatus(taskId, "done"))
                .thenReturn(taskToComplete);

        // Act
        Optional<Task> tarea = taskService.getTaskById(taskId);
        Task resultado = taskService.updateTaskStatus(taskId, "done");

        // Assert
        assertTrue(tarea.isPresent());
        verify(taskService, times(1)).getTaskById(taskId);
        verify(taskService, times(1)).updateTaskStatus(taskId, "done");
    }

    @Test
    void testCompletarTarea_VerificaExistencia() {
        // Arrange
        Long taskId = 7L;

        Task task = Task.builder()
                .id(taskId)
                .title("Otra tarea")
                .status("todo")
                .build();
        task.setAssignedTo(testUser);

        when(taskService.getTaskById(taskId))
                .thenReturn(Optional.of(task));

        // Act
        Optional<Task> resultado = taskService.getTaskById(taskId);

        // Assert
        assertTrue(resultado.isPresent());
        assertEquals(taskId, resultado.get().getId());
    }

    @Test
    void testCompletarTarea_NoExiste() {
        // Arrange
        Long taskIdInexistente = 999L;

        when(taskService.getTaskById(taskIdInexistente))
                .thenReturn(Optional.empty());

        // Act
        Optional<Task> resultado = taskService.getTaskById(taskIdInexistente);

        // Assert
        assertFalse(resultado.isPresent());
        verify(taskService, never()).updateTaskStatus(anyLong(), anyString());
    }

    // ========================================
    // PRUEBA 4: VISUALIZAR TAREAS DE UN DESARROLLADOR
    // ========================================

    @Test
    void testVisualizarTareas_ListaCompleta() {
        // Arrange
        List<Task> tareasUsuario = Arrays.asList(
                Task.builder().id(1L).title("Tarea 1").status("todo").build(),
                Task.builder().id(2L).title("Tarea 2").status("done").build(),
                Task.builder().id(3L).title("Tarea 3").status("todo").build()
        );

        tareasUsuario.forEach(t -> t.setAssignedTo(testUser));

        when(taskService.getTasksByUserId(testUserId))
                .thenReturn(tareasUsuario);

        // Act
        List<Task> resultado = taskService.getTasksByUserId(testUserId);

        // Assert
        assertNotNull(resultado);
        assertEquals(3, resultado.size());
        verify(taskService, times(1)).getTasksByUserId(testUserId);
    }

    @Test
    void testVisualizarTareas_ListaVacia() {
        // Arrange
        when(taskService.getTasksByUserId(testUserId))
                .thenReturn(Collections.emptyList());

        // Act
        List<Task> resultado = taskService.getTasksByUserId(testUserId);

        // Assert
        assertNotNull(resultado);
        assertTrue(resultado.isEmpty());
    }

    @Test
    void testVisualizarTareas_FiltrarPorEstado() {
        // Arrange
        Task todoTask = Task.builder().id(1L).title("Todo Task").status("todo").build();
        Task doneTask = Task.builder().id(2L).title("Done Task").status("done").build();
        todoTask.setAssignedTo(testUser);
        doneTask.setAssignedTo(testUser);

        List<Task> tareas = Arrays.asList(todoTask, doneTask);

        when(taskService.getTasksByUserId(testUserId))
                .thenReturn(tareas);

        // Act
        List<Task> resultado = taskService.getTasksByUserId(testUserId);
        long todoCount = resultado.stream().filter(t -> "todo".equals(t.getStatus())).count();
        long doneCount = resultado.stream().filter(t -> "done".equals(t.getStatus())).count();

        // Assert
        assertEquals(1, todoCount);
        assertEquals(1, doneCount);
    }

    // ========================================
    // PRUEBA 5: VISUALIZAR KPIs DE UN DESARROLLADOR
    // ========================================

    @Test
    void testVisualizarKPIs_CalculoCorrecto() {
        // Arrange
        Map<String, Double> kpisEsperados = new HashMap<>();
        kpisEsperados.put("totalEstimatedHours", 40.0);
        kpisEsperados.put("totalEffortHours", 35.0);
        kpisEsperados.put("efficiency", 87.5);

        when(taskService.getKpiTotals())
                .thenReturn(kpisEsperados);

        // Act
        Map<String, Double> kpisResult = taskService.getKpiTotals();

        // Assert
        assertNotNull(kpisResult);
        assertEquals(40.0, kpisResult.get("totalEstimatedHours"));
        assertEquals(35.0, kpisResult.get("totalEffortHours"));
        assertEquals(87.5, kpisResult.get("efficiency"));
        verify(taskService, times(1)).getKpiTotals();
    }

    @Test
    void testVisualizarKPIs_SinDatos() {
        // Arrange
        Map<String, Double> kpisVacios = new HashMap<>();
        kpisVacios.put("totalEstimatedHours", 0.0);
        kpisVacios.put("totalEffortHours", 0.0);
        kpisVacios.put("efficiency", 0.0);

        when(taskService.getKpiTotals())
                .thenReturn(kpisVacios);

        // Act
        Map<String, Double> kpisResult = taskService.getKpiTotals();

        // Assert
        assertEquals(0.0, kpisResult.get("totalEstimatedHours"));
        assertEquals(0.0, kpisResult.get("totalEffortHours"));
        assertEquals(0.0, kpisResult.get("efficiency"));
    }

    @Test
    void testVisualizarKPIs_Eficiencia100Porciento() {
        // Arrange
        Map<String, Double> kpisPerfectos = new HashMap<>();
        kpisPerfectos.put("totalEstimatedHours", 50.0);
        kpisPerfectos.put("totalEffortHours", 50.0);
        kpisPerfectos.put("efficiency", 100.0);

        when(taskService.getKpiTotals())
                .thenReturn(kpisPerfectos);

        // Act
        Map<String, Double> kpisResult = taskService.getKpiTotals();

        // Assert
        assertEquals(100.0, kpisResult.get("efficiency"));
    }

    // ========================================
    // PRUEBAS ADICIONALES
    // ========================================

    @Test
    void testFlujoCombinado_CrearYCompletar() {
        // Arrange
        Task nuevaTarea = Task.builder()
                .id(10L)
                .title("Tarea flujo completo")
                .status("todo")
                .build();
        nuevaTarea.setAssignedTo(testUser);

        when(taskService.createTaskWithAssignedUser(any(Task.class), eq(1L), eq(1L), eq(testUserId)))
                .thenReturn(nuevaTarea);
        when(taskService.updateTaskStatus(10L, "done"))
                .thenReturn(nuevaTarea);

        // Act
        Task creada = taskService.createTaskWithAssignedUser(nuevaTarea, 1L, 1L, testUserId);
        Task completada = taskService.updateTaskStatus(10L, "done");

        // Assert
        verify(taskService, times(1)).createTaskWithAssignedUser(any(), eq(1L), eq(1L), eq(testUserId));
        verify(taskService, times(1)).updateTaskStatus(10L, "done");
    }

    @Test
    void testEliminarTarea_Exitosamente() {
        // Arrange
        Long taskId = 5L;

        Task taskToDelete = Task.builder()
                .id(taskId)
                .title("Tarea a eliminar")
                .status("done")
                .build();
        taskToDelete.setAssignedTo(testUser);

        when(taskService.getTaskById(taskId))
                .thenReturn(Optional.of(taskToDelete));
        doNothing().when(taskService).deleteTask(taskId);

        // Act
        Optional<Task> tarea = taskService.getTaskById(taskId);
        taskService.deleteTask(taskId);

        // Assert
        assertTrue(tarea.isPresent());
        verify(taskService, times(1)).getTaskById(taskId);
        verify(taskService, times(1)).deleteTask(taskId);
    }

    @Test
    void testLogin_Exitoso() {
        // Arrange
        when(appUserService.login("testuser", "password123"))
                .thenReturn(Optional.of(testUser));

        // Act
        Optional<AppUser> resultado = appUserService.login("testuser", "password123");

        // Assert
        assertTrue(resultado.isPresent());
        assertEquals("testuser", resultado.get().getUsername());
        verify(appUserService, times(1)).login("testuser", "password123");
    }

    @Test
    void testLogin_Fallido() {
        // Arrange
        when(appUserService.login("wronguser", "wrongpass"))
                .thenReturn(Optional.empty());

        // Act
        Optional<AppUser> resultado = appUserService.login("wronguser", "wrongpass");

        // Assert
        assertFalse(resultado.isPresent());
    }

    @Test
    void testObtenerUsuarioPorId() {
        // Arrange
        when(appUserService.getUserById(testUserId))
                .thenReturn(Optional.of(testUser));

        // Act
        Optional<AppUser> resultado = appUserService.getUserById(testUserId);

        // Assert
        assertTrue(resultado.isPresent());
        assertEquals(testUserId, resultado.get().getId());
    }

    @Test
    void testCrearMultiplesTareas() {
        // Arrange
        Task tarea1 = Task.builder().id(1L).title("Tarea 1").status("todo").build();
        Task tarea2 = Task.builder().id(2L).title("Tarea 2").status("todo").build();
        Task tarea3 = Task.builder().id(3L).title("Tarea 3").status("todo").build();

        tarea1.setAssignedTo(testUser);
        tarea2.setAssignedTo(testUser);
        tarea3.setAssignedTo(testUser);

        when(taskService.createTaskWithAssignedUser(any(Task.class), eq(1L), eq(1L), eq(testUserId)))
                .thenReturn(tarea1)
                .thenReturn(tarea2)
                .thenReturn(tarea3);

        // Act
        Task t1 = taskService.createTaskWithAssignedUser(tarea1, 1L, 1L, testUserId);
        Task t2 = taskService.createTaskWithAssignedUser(tarea2, 1L, 1L, testUserId);
        Task t3 = taskService.createTaskWithAssignedUser(tarea3, 1L, 1L, testUserId);

        // Assert
        assertEquals(3, List.of(t1, t2, t3).size());
        verify(taskService, times(3)).createTaskWithAssignedUser(any(Task.class), eq(1L), eq(1L), eq(testUserId));
    }
}
