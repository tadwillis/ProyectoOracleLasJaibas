package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.*;
import com.springboot.MyTodoList.repository.TaskRepository;
import com.springboot.MyTodoList.repository.UserStoryRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TelegramAIService {

    private static final Logger logger = LoggerFactory.getLogger(TelegramAIService.class);

    private final DeepSeekService deepSeekService;
    private final AppUserService appUserService;
    private final TaskService taskService;
    private final SprintService sprintService;
    private final TeamMemberService teamMemberService;
    private final UserStoryRepository userStoryRepository;
    private final TaskRepository taskRepository;

    // Sesiones activas: chatId -> usuario autenticado
    private final Map<Long, AppUser> activeSessions = new ConcurrentHashMap<>();

    // Estado del proceso de login: chatId -> estado
    private final Map<Long, LoginState> loginStates = new ConcurrentHashMap<>();

    // Username temporal durante el login: chatId -> username
    private final Map<Long, String> pendingUsernames = new ConcurrentHashMap<>();

    // Tareas pendientes de confirmación: chatId -> propuesta de tarea
    private final Map<Long, PendingTaskProposal> pendingTaskProposals = new ConcurrentHashMap<>();

    // Estado de espera de descripción de tarea: chatId -> true si está esperando
    private final Map<Long, Boolean> waitingTaskDescription = new ConcurrentHashMap<>();

    private enum LoginState {
        WAITING_USERNAME,
        WAITING_PASSWORD
    }

    /**
     * Clase interna para almacenar propuestas de tareas pendientes de confirmación
     */
    private static class PendingTaskProposal {
        String taskCode;
        String title;
        String description;
        Integer estimatedHours;
        Integer priority;
        Date dueDate;
        Long sprintId;
        String sprintName;
        Long teamId;
        Long storyId;
        Long assignedUserId;
        String assignedUserName;
    }

    private static final String SYSTEM_PROMPT = """
        Eres un asistente virtual amigable y profesional para desarrolladores de Oracle.
        Tu nombre es "Asistente de Tareas".

        Tu rol es ayudar a los usuarios a:
        - Consultar sus tareas pendientes y completadas
        - Ver información de sprints
        - Obtener resúmenes de su trabajo
        - Responder preguntas sobre su progreso
        - Ver sus KPIs y métricas de rendimiento
        - Identificar tareas próximas a vencer
        - Marcar tareas como completadas
        - Crear nuevas tareas
        - Asignar tareas a otros miembros del equipo

        REGLAS CRÍTICAS (NUNCA VIOLAR):
        - JAMÁS inventes, imagines o supongas tareas, títulos, fechas, horas o cualquier dato
        - SOLO menciona las tareas que aparecen EXPLÍCITAMENTE en el contexto proporcionado
        - Si el contexto dice "El usuario no tiene tareas asignadas actualmente", responde EXACTAMENTE eso
        - Si no hay datos de tareas en el contexto, di "no tienes tareas asignadas"
        - NUNCA crees ejemplos ficticios de tareas
        - Basa tus respuestas ÚNICAMENTE en los datos EXACTOS del contexto

        Instrucciones generales:
        - Responde siempre en español
        - Sé amable, conciso y útil
        - Usa un tono conversacional y natural, como si fueras un colega
        - Cuando muestres listas de tareas, copia los títulos EXACTOS del contexto
        - Si el usuario saluda, responde amablemente y pregunta en qué puedes ayudar
        - Si el usuario tiene tareas completadas pero no pendientes, felicítalo

        Cuando el usuario pregunte por KPIs o métricas:
        - Muestra las horas estimadas vs trabajadas
        - Calcula y muestra la eficiencia
        - Indica cuántas tareas ha completado vs planificadas

        Cuando el usuario pregunte por tareas próximas a vencer:
        - Muestra las tareas ordenadas por urgencia
        - Indica cuántos días faltan para cada una
        - Alerta si alguna está vencida o vence hoy

        Cuando el usuario quiera marcar una tarea como completada:
        - Si el mensaje contiene "TAREA_COMPLETADA:" seguido del resultado, confirma la acción
        - Si hubo error, explica qué salió mal

        Cuando el usuario quiera crear una nueva tarea:
        - Si el mensaje contiene "TAREA_CREADA:" seguido del resultado, confirma la acción
        - Muestra el título y tiempo estimado de la tarea creada
        - Si hubo error, explica qué salió mal

        Cuando el usuario quiera asignar una tarea:
        - Si el mensaje contiene "TAREA_ASIGNADA:" seguido del resultado, confirma la acción
        - Indica a quién se asignó la tarea
        - Si hubo error, explica qué salió mal

        Formato para tareas:
        - Usa viñetas o números para listar
        - Incluye el título y estado de cada tarea
        - Si hay fecha límite, menciónala
        """;

    /**
     * Procesa un mensaje del usuario y genera una respuesta inteligente
     */
    public String processMessage(Long chatId, String userMessage) {
        try {
            // Verificar si el usuario tiene una sesión activa
            AppUser user = activeSessions.get(chatId);

            if (user != null) {
                // Detectar intención de cerrar sesión conversacionalmente
                String lowerMsg = userMessage.toLowerCase();
                if (lowerMsg.contains("cerrar sesión") || lowerMsg.contains("salir") ||
                    lowerMsg.contains("logout") || lowerMsg.contains("desconectar")) {
                    return handleLogout(chatId);
                }

                // Verificar si hay una tarea pendiente de confirmación
                if (pendingTaskProposals.containsKey(chatId)) {
                    return handleTaskConfirmation(chatId, user, userMessage);
                }
                // Verificar si está esperando descripción de tarea
                if (waitingTaskDescription.containsKey(chatId) && waitingTaskDescription.get(chatId)) {
                    waitingTaskDescription.remove(chatId);
                    return handleCreateTaskProposal(chatId, user, userMessage);
                }
                // Usuario autenticado - procesar mensaje con IA
                return processAuthenticatedMessage(user, userMessage, chatId);
            }

            // Usuario no autenticado - manejar proceso de login
            return handleLoginProcess(chatId, userMessage);
        } catch (Exception e) {
            String errorCode = "ERR_GLOBAL_001";
            logger.error("[{}] Error global procesando mensaje: {}", errorCode, e.getMessage(), e);
            return "Error del sistema [" + errorCode + "]. Por favor, intenta de nuevo.";
        }
    }

    /**
     * Maneja el proceso de login paso a paso
     */
    private String handleLoginProcess(Long chatId, String userMessage) {
        LoginState currentState = loginStates.get(chatId);

        if (currentState == null) {
            // Inicio del proceso de login
            loginStates.put(chatId, LoginState.WAITING_USERNAME);
            return """
                ¡Hola! Bienvenido al Asistente de Tareas.

                Para comenzar, necesito que inicies sesión.

                Por favor, escribe tu nombre de usuario:""";
        }

        if (currentState == LoginState.WAITING_USERNAME) {
            // Guardar username y pedir password
            String username = userMessage.trim();

            // Verificar que el usuario existe
            Optional<AppUser> userOpt = appUserService.getUserByUsername(username);
            if (userOpt.isEmpty()) {
                return "No encontré ningún usuario con el nombre '" + username + "'.\n\n" +
                       "Por favor, verifica tu nombre de usuario e intenta de nuevo:";
            }

            pendingUsernames.put(chatId, username);
            loginStates.put(chatId, LoginState.WAITING_PASSWORD);
            return "Perfecto, ahora escribe tu contraseña:";
        }

        if (currentState == LoginState.WAITING_PASSWORD) {
            // Validar credenciales
            String username = pendingUsernames.get(chatId);
            String password = userMessage.trim();

            Optional<AppUser> userOpt = appUserService.getUserByUsername(username);

            if (userOpt.isPresent()) {
                AppUser user = userOpt.get();

                // Validar contraseña
                if (appUserService.validatePassword(password, user.getPassword())) {
                    // Login exitoso
                    activeSessions.put(chatId, user);
                    loginStates.remove(chatId);
                    pendingUsernames.remove(chatId);

                    logger.info("Usuario {} inició sesión desde chatId {}", username, chatId);

                    return String.format(
                        "¡Bienvenido %s! Has iniciado sesión correctamente.\n\n" +
                        "Puedo ayudarte con:\n" +
                        "- Ver tus tareas pendientes y completadas\n" +
                        "- Consultar tus KPIs personales\n" +
                        "- Ver tareas próximas a vencer\n" +
                        "- Crear nuevas tareas\n" +
                        "- Asignar tareas a otros integrantes\n" +
                        "- Marcar tareas como completadas\n" +
                        "- Consultar información de sprints\n\n" +
                        "Para cerrar sesión, solo dime \"quiero salir\" o \"cerrar sesión\".\n\n" +
                        "¿En qué puedo ayudarte?",
                        user.getFullName()
                    );
                }
            }

            // Credenciales inválidas
            loginStates.put(chatId, LoginState.WAITING_USERNAME);
            pendingUsernames.remove(chatId);

            return "Contraseña incorrecta.\n\n" +
                   "Por favor, intenta de nuevo. Escribe tu nombre de usuario:";
        }

        // Estado desconocido - reiniciar
        loginStates.remove(chatId);
        pendingUsernames.remove(chatId);
        return processMessage(chatId, userMessage);
    }

    /**
     * Maneja el cierre de sesión
     */
    private String handleLogout(Long chatId) {
        AppUser user = activeSessions.remove(chatId);
        loginStates.remove(chatId);
        pendingUsernames.remove(chatId);

        if (user != null) {
            logger.info("Usuario {} cerró sesión desde chatId {}", user.getUsername(), chatId);
            return String.format("¡Hasta luego %s! Has cerrado sesión correctamente.\n\n" +
                                "Escribe cualquier mensaje para iniciar sesión nuevamente.",
                                user.getFullName());
        }

        return "No tenías una sesión activa.\n\nEscribe cualquier mensaje para iniciar sesión.";
    }

    /**
     * Procesa un mensaje de un usuario autenticado usando IA
     */
    private String processAuthenticatedMessage(AppUser user, String userMessage, Long chatId) {
        String lowerMessage = userMessage.toLowerCase();

        // Detectar intención de crear nueva tarea
        if (lowerMessage.contains("crear tarea") || lowerMessage.contains("nueva tarea") ||
            lowerMessage.contains("dar de alta") || lowerMessage.contains("agregar tarea") ||
            lowerMessage.contains("añadir tarea") || lowerMessage.contains("quiero crear") ||
            (lowerMessage.contains("crear") && lowerMessage.contains("tarea"))) {

            // Verificar si el usuario ya proporcionó descripción
            String basicIdea = extractBasicTaskIdea(userMessage);
            if (basicIdea == null || basicIdea.trim().isEmpty() ||
                basicIdea.equalsIgnoreCase("una") || basicIdea.length() < 5) {
                // No hay descripción, preguntar por ella
                waitingTaskDescription.put(chatId, true);
                return "¿En qué consiste la tarea?";
            }

            return handleCreateTaskProposal(chatId, user, userMessage);
        }

        // Detectar intención de asignar tarea
        if (lowerMessage.contains("asignar") && (lowerMessage.contains("tarea") || lowerMessage.contains(" a "))) {

            String result = handleAssignTask(user, userMessage);
            if (result != null) {
                String context = buildUserContext(user);
                String fullPrompt = context + "\n\nTAREA_ASIGNADA: " + result + "\n\nMensaje original del usuario: " + userMessage;

                try {
                    return deepSeekService.generateTextWithContext(SYSTEM_PROMPT, fullPrompt);
                } catch (Exception e) {
                    String errorCode = "ERR_DEEPSEEK_002";
                    logger.error("[{}] Error procesando asignación con IA: {}", errorCode, e.getMessage());
                    return result + "\n\n(Nota: Error de IA [" + errorCode + "])";
                }
            }
        }

        // Detectar intención de marcar tarea como completada
        if (lowerMessage.contains("completar") || lowerMessage.contains("terminar") ||
            lowerMessage.contains("finalizar") || lowerMessage.contains("marcar") &&
            (lowerMessage.contains("hecha") || lowerMessage.contains("completada") || lowerMessage.contains("terminada") || lowerMessage.contains("done"))) {

            String result = handleMarkTaskComplete(user, userMessage);
            if (result != null) {
                // Agregar el resultado al contexto para que la IA lo confirme
                String context = buildUserContext(user);
                String fullPrompt = context + "\n\nTAREA_COMPLETADA: " + result + "\n\nMensaje original del usuario: " + userMessage;

                try {
                    return deepSeekService.generateTextWithContext(SYSTEM_PROMPT, fullPrompt);
                } catch (Exception e) {
                    String errorCode = "ERR_DEEPSEEK_003";
                    logger.error("[{}] Error procesando completar tarea con IA: {}", errorCode, e.getMessage());
                    return result + "\n\n(Nota: Error de IA [" + errorCode + "])";
                }
            }
        }

        // Construir contexto de forma segura
        String context;
        try {
            context = buildUserContext(user);
        } catch (Exception e) {
            String errorCode = "ERR_CONTEXT_001";
            logger.error("[{}] Error construyendo contexto del usuario: {}", errorCode, e.getMessage());
            // Usar contexto mínimo pero continuar con DeepSeek
            context = "Usuario: " + user.getFullName() + "\nFecha actual: " +
                LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        }

        String fullPrompt = context + "\n\nMensaje del usuario: " + userMessage;
        
        // Log del prompt completo que se enviará a DeepSeek
        logger.info("🔍 DEBUG - PROMPT COMPLETO PARA DEEPSEEK:");
        logger.info("====================================================");
        logger.info("{}", fullPrompt);
        logger.info("====================================================");

        try {
            return deepSeekService.generateTextWithContext(SYSTEM_PROMPT, fullPrompt);
        } catch (Exception e) {
            String errorCode = "ERR_DEEPSEEK_001";
            logger.error("[{}] Error al procesar mensaje con DeepSeek: {} - Mensaje: {}",
                errorCode, e.getMessage(), userMessage);
            return "Error de conexión con el servicio de IA [" + errorCode + "]. " +
                   "Por favor, intenta de nuevo en unos segundos.";
        }
    }

    /**
     * Maneja la intención de marcar una tarea como completada
     */
    private String handleMarkTaskComplete(AppUser user, String userMessage) {
        List<Task> userTasks = taskService.getTasksByAssignedUser(user.getId());
        List<Task> pendingTasks = userTasks.stream()
            .filter(t -> {
                String status = t.getStatus();
                return status == null || (!status.equalsIgnoreCase("done") && !status.equalsIgnoreCase("cancelled"));
            })
            .collect(Collectors.toList());

        if (pendingTasks.isEmpty()) {
            return "No tienes tareas pendientes para marcar como completadas.";
        }

        // Buscar la tarea mencionada en el mensaje
        String lowerMessage = userMessage.toLowerCase();
        Task matchedTask = null;

        for (Task task : pendingTasks) {
            String taskTitle = task.getTitle().toLowerCase();
            // Buscar coincidencia parcial del título en el mensaje
            if (lowerMessage.contains(taskTitle) || containsSignificantWords(lowerMessage, taskTitle)) {
                matchedTask = task;
                break;
            }
        }

        if (matchedTask == null) {
            // No se encontró coincidencia, mostrar lista de tareas disponibles
            StringBuilder sb = new StringBuilder();
            sb.append("No pude identificar qué tarea deseas completar. Tus tareas pendientes son:\n\n");
            for (int i = 0; i < pendingTasks.size(); i++) {
                sb.append(i + 1).append(". ").append(pendingTasks.get(i).getTitle()).append("\n");
            }
            sb.append("\nPor favor, indica el nombre de la tarea que deseas marcar como completada.");
            return sb.toString();
        }

        // Marcar la tarea como completada
        try {
            taskService.updateTaskStatus(matchedTask.getId(), "done");
            logger.info("Usuario {} marcó tarea '{}' como completada", user.getUsername(), matchedTask.getTitle());
            return "La tarea '" + matchedTask.getTitle() + "' ha sido marcada como completada exitosamente.";
        } catch (Exception e) {
            String errorCode = "ERR_TASK_COMPLETE_001";
            logger.error("[{}] Error al marcar tarea como completada: {}", errorCode, e.getMessage());
            return "Error al marcar la tarea como completada [" + errorCode + "]. Por favor, intenta de nuevo.";
        }
    }

    /**
     * Verifica si el mensaje contiene palabras significativas del título de la tarea
     */
    private boolean containsSignificantWords(String message, String taskTitle) {
        String[] words = taskTitle.split("\\s+");
        int matchCount = 0;
        int significantWords = 0;

        for (String word : words) {
            // Ignorar palabras muy cortas o comunes
            if (word.length() > 3) {
                significantWords++;
                if (message.contains(word)) {
                    matchCount++;
                }
            }
        }

        // Si hay al menos 2 palabras significativas que coinciden, o más del 50% coinciden
        return matchCount >= 2 || (significantWords > 0 && (double) matchCount / significantWords > 0.5);
    }

    /**
     * Genera una propuesta inteligente de tarea usando DeepSeek
     */
    private String handleCreateTaskProposal(Long chatId, AppUser user, String userMessage) {
        try {
            // Obtener el equipo del usuario
            List<TeamMember> memberships = teamMemberService.getUserTeamMemberships(user.getId());
            if (memberships.isEmpty()) {
                return "Error: No perteneces a ningún equipo. Contacta al administrador.";
            }
            Team team = memberships.get(0).getTeam();

            // Obtener una user story del equipo
            List<UserStory> stories = userStoryRepository.findByTeamId(team.getId());
            if (stories.isEmpty()) {
                return "Error: No hay historias de usuario disponibles para tu equipo.";
            }
            UserStory story = stories.get(0);

            // Obtener sprint activo
            Sprint activeSprint = null;
            String sprintName = "Sin sprint";
            try {
                List<Sprint> sprints = sprintService.getAllSprints();
                activeSprint = sprints.stream()
                    .filter(s -> s.getStatus().equalsIgnoreCase("active") || s.getStatus().equalsIgnoreCase("in_progress"))
                    .findFirst()
                    .orElse(null);
                if (activeSprint != null) {
                    sprintName = activeSprint.getName();
                }
            } catch (Exception e) {
                logger.warn("No se pudo obtener sprint activo: {}", e.getMessage());
            }

            // Generar código de tarea basado en el máximo existente
            List<Task> teamTasks = taskService.getTasksByTeam(team.getId());
            int maxTaskNumber = 0;
            for (Task task : teamTasks) {
                // Extraer número del título si tiene formato TT-XX-YY
                String title = task.getTitle();
                if (title != null && title.startsWith("TT-")) {
                    try {
                        String[] parts = title.split("-");
                        if (parts.length >= 3) {
                            int num = Integer.parseInt(parts[2].split(" ")[0]);
                            if (num > maxTaskNumber) {
                                maxTaskNumber = num;
                            }
                        }
                    } catch (Exception ignored) {}
                }
            }
            int taskNumber = maxTaskNumber + 1;
            String taskCode = String.format("TT-%02d-%02d", team.getId(), taskNumber);

            // Extraer idea básica del usuario
            String basicIdea = extractBasicTaskIdea(userMessage);
            if (basicIdea == null || basicIdea.trim().isEmpty()) {
                return "No pude identificar la tarea que deseas crear. Por favor, describe brevemente qué tarea necesitas.\n\n" +
                       "Ejemplo: \"Crear tarea: hacer video de demo para release\"";
            }

            // Usar DeepSeek para generar propuesta inteligente
            String aiPrompt = String.format("""
                Analiza esta idea de tarea y genera una propuesta estructurada en formato JSON:

                Idea del usuario: "%s"
                Contexto: Equipo de desarrollo Oracle, Sprint actual: %s

                Genera un JSON con estos campos (solo el JSON, sin texto adicional):
                {
                    "title": "título profesional y claro (máximo 100 caracteres)",
                    "description": "descripción detallada de la tarea (2-3 oraciones)",
                    "estimatedHours": número entero de horas estimadas (1-40),
                    "priority": número de 0 a 2 (0=baja, 1=media, 2=alta),
                    "suggestedDueDays": días sugeridos para completar (1-14)
                }

                Responde SOLO con el JSON, sin explicaciones.
                """, basicIdea, sprintName);

            String aiResponse;
            try {
                aiResponse = deepSeekService.generateTextWithContext(
                    "Eres un asistente de gestión de proyectos. Responde solo con JSON válido.",
                    aiPrompt
                );
            } catch (Exception e) {
                String errorCode = "ERR_DEEPSEEK_004";
                logger.error("[{}] Error generando propuesta de tarea con DeepSeek: {}", errorCode, e.getMessage());
                return "Error al generar la propuesta de tarea [" + errorCode + "]. Por favor, intenta de nuevo.";
            }

            // Parsear respuesta de IA
            String title = basicIdea;
            String description = "Tarea creada desde Telegram";
            int estimatedHours = 2;
            int priority = 1; // Media por defecto
            int dueDays = 7;

            try {
                // Extraer valores del JSON
                Pattern titlePattern = Pattern.compile("\"title\"\\s*:\\s*\"([^\"]+)\"");
                Pattern descPattern = Pattern.compile("\"description\"\\s*:\\s*\"([^\"]+)\"");
                Pattern hoursPattern = Pattern.compile("\"estimatedHours\"\\s*:\\s*(\\d+)");
                Pattern priorityPattern = Pattern.compile("\"priority\"\\s*:\\s*(\\d+)");
                Pattern daysPattern = Pattern.compile("\"suggestedDueDays\"\\s*:\\s*(\\d+)");

                Matcher m = titlePattern.matcher(aiResponse);
                if (m.find()) title = m.group(1);

                m = descPattern.matcher(aiResponse);
                if (m.find()) description = m.group(1);

                m = hoursPattern.matcher(aiResponse);
                if (m.find()) estimatedHours = Integer.parseInt(m.group(1));

                m = priorityPattern.matcher(aiResponse);
                if (m.find()) priority = Integer.parseInt(m.group(1));

                m = daysPattern.matcher(aiResponse);
                if (m.find()) dueDays = Integer.parseInt(m.group(1));
            } catch (Exception e) {
                String errorCode = "ERR_PARSE_001";
                logger.warn("[{}] Error parseando respuesta JSON de IA: {}", errorCode, e.getMessage());
            }

            // Calcular fecha de vencimiento
            LocalDate dueLocalDate = LocalDate.now().plusDays(dueDays);
            Date dueDate = Date.from(dueLocalDate.atStartOfDay(ZoneId.systemDefault()).toInstant());

            // Crear propuesta
            PendingTaskProposal proposal = new PendingTaskProposal();
            proposal.taskCode = taskCode;
            proposal.title = title;
            proposal.description = description;
            proposal.estimatedHours = estimatedHours;
            proposal.priority = priority;
            proposal.dueDate = dueDate;
            proposal.sprintId = activeSprint != null ? activeSprint.getId() : null;
            proposal.sprintName = sprintName;
            proposal.teamId = team.getId();
            proposal.storyId = story.getId();
            proposal.assignedUserId = user.getId();
            proposal.assignedUserName = user.getFullName();

            // Guardar propuesta pendiente
            pendingTaskProposals.put(chatId, proposal);

            // Formatear template para el usuario
            String priorityText = switch (priority) {
                case 0 -> "Baja";
                case 1 -> "Media";
                case 2 -> "Alta";
                default -> "Media";
            };

            String template = String.format("""
                %s %s

                %s

                | Horas: %d | Prioridad: %s | %s |
                | Fecha límite: %s | Asignada a: %s |

                ¿Confirmas? (sí/no)
                """,
                taskCode,
                title,
                description,
                estimatedHours,
                priorityText,
                sprintName,
                dueLocalDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                user.getFullName()
            );

            return template;

        } catch (Exception e) {
            String errorCode = "ERR_TASK_PROPOSAL_001";
            logger.error("[{}] Error al generar propuesta de tarea: {}", errorCode, e.getMessage());
            return "Error al procesar la solicitud [" + errorCode + "]. Por favor, intenta de nuevo.";
        }
    }

    /**
     * Maneja la confirmación o modificación de una tarea propuesta
     */
    private String handleTaskConfirmation(Long chatId, AppUser user, String userMessage) {
        PendingTaskProposal proposal = pendingTaskProposals.get(chatId);
        if (proposal == null) {
            return "No hay ninguna tarea pendiente de confirmación.";
        }

        String lowerMessage = userMessage.toLowerCase().trim();

        // Cancelar
        if (lowerMessage.equals("no") || lowerMessage.equals("cancelar") || lowerMessage.contains("cancelar")) {
            pendingTaskProposals.remove(chatId);
            return "Creación de tarea cancelada. ¿En qué más puedo ayudarte?";
        }

        // Confirmar
        if (lowerMessage.equals("sí") || lowerMessage.equals("si") || lowerMessage.equals("confirmar") ||
            lowerMessage.equals("ok") || lowerMessage.equals("crear") || lowerMessage.contains("confirmar")) {

            try {
                // Obtener el team real de la base de datos
                List<TeamMember> memberships = teamMemberService.getUserTeamMemberships(user.getId());
                if (memberships.isEmpty()) {
                    pendingTaskProposals.remove(chatId);
                    return "Error: No se encontró tu equipo. Contacta al administrador.";
                }
                Team team = memberships.get(0).getTeam();

                // Obtener user story
                UserStory story = userStoryRepository.findById(proposal.storyId).orElse(null);
                if (story == null) {
                    pendingTaskProposals.remove(chatId);
                    return "Error: No se encontró la historia de usuario.";
                }

                // Obtener el usuario fresco de la base de datos (el de sesión está detached)
                AppUser freshUser = appUserService.getUserById(user.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

                // Crear la tarea con todos los campos correctos
                Task newTask = Task.builder()
                    .title(proposal.taskCode + " - " + proposal.title)
                    .description(proposal.description)
                    .userStory(story)
                    .team(team)
                    .assignedTo(freshUser)
                    .status("todo")
                    .priority(proposal.priority)
                    .estimatedHours(proposal.estimatedHours)
                    .dueDate(proposal.dueDate)
                    .startDate(new Date()) // Fecha de inicio = hoy
                    .build();

                // Configurar sprint si existe
                if (proposal.sprintId != null) {
                    try {
                        Sprint sprint = sprintService.getSprintById(proposal.sprintId).orElse(null);
                        newTask.setSprint(sprint);
                    } catch (Exception e) {
                        String errorCode = "ERR_SPRINT_001";
                        logger.warn("[{}] No se pudo asignar sprint: {}", errorCode, e.getMessage());
                    }
                }

                Task savedTask = taskRepository.save(newTask);
                pendingTaskProposals.remove(chatId);

                logger.info("Usuario {} creó tarea '{}' con ID {}", user.getUsername(), savedTask.getTitle(), savedTask.getId());

                return String.format("""
                    Tarea creada exitosamente:

                    %s - %s
                    Horas: %d | Prioridad: %s
                    """,
                    proposal.taskCode,
                    proposal.title,
                    proposal.estimatedHours,
                    proposal.priority == 2 ? "Alta" : proposal.priority == 1 ? "Media" : "Baja"
                );

            } catch (Exception e) {
                String errorCode = "ERR_TASK_CREATE_001";
                logger.error("[{}] Error al crear tarea: {}", errorCode, e.getMessage(), e);
                pendingTaskProposals.remove(chatId);
                return "Error al crear la tarea [" + errorCode + "]. Por favor, intenta de nuevo.";
            }
        }

        // Modificaciones - detectar intención de cambiar algo
        if (lowerMessage.contains("cambiar") || lowerMessage.contains("modificar") ||
            lowerMessage.contains("agrega") || lowerMessage.contains("añade") ||
            lowerMessage.contains("quita") || lowerMessage.contains("pon") ||
            lowerMessage.contains("título") || lowerMessage.contains("titulo") ||
            lowerMessage.contains("descripción") || lowerMessage.contains("descripcion") ||
            lowerMessage.contains("hora") || lowerMessage.contains("prioridad")) {

            // Usar DeepSeek para interpretar los cambios solicitados
            try {
                String modificationPrompt = String.format("""
                    El usuario quiere modificar una propuesta de tarea. Analiza su mensaje y genera un JSON con los cambios.

                    Propuesta actual:
                    - Título: "%s"
                    - Descripción: "%s"
                    - Horas estimadas: %d
                    - Prioridad: %d

                    Mensaje del usuario: "%s"

                    Genera un JSON con SOLO los campos que el usuario quiere cambiar:
                    {
                        "title": "nuevo título si lo pidió (o null si no)",
                        "description": "nueva descripción si la pidió (o null si no)",
                        "estimatedHours": número si lo pidió (o null si no),
                        "priority": número 0-2 si lo pidió (0=baja, 1=media, 2=alta, o null si no)
                    }

                    IMPORTANTE: Si el usuario dice "agregar" algo al título o descripción, AÑÁDELO al texto existente, no lo reemplaces.
                    Responde SOLO con el JSON.
                    """,
                    proposal.title,
                    proposal.description,
                    proposal.estimatedHours,
                    proposal.priority,
                    userMessage);

                String aiResponse = deepSeekService.generateTextWithContext(
                    "Eres un asistente que interpreta modificaciones. Responde solo con JSON válido.",
                    modificationPrompt
                );

                // Aplicar cambios del JSON
                boolean changed = false;

                Pattern titlePattern = Pattern.compile("\"title\"\\s*:\\s*\"([^\"]+)\"");
                Matcher m = titlePattern.matcher(aiResponse);
                if (m.find() && !m.group(1).equals("null")) {
                    proposal.title = m.group(1);
                    changed = true;
                }

                Pattern descPattern = Pattern.compile("\"description\"\\s*:\\s*\"([^\"]+)\"");
                m = descPattern.matcher(aiResponse);
                if (m.find() && !m.group(1).equals("null")) {
                    proposal.description = m.group(1);
                    changed = true;
                }

                Pattern hoursPattern = Pattern.compile("\"estimatedHours\"\\s*:\\s*(\\d+)");
                m = hoursPattern.matcher(aiResponse);
                if (m.find()) {
                    proposal.estimatedHours = Integer.parseInt(m.group(1));
                    changed = true;
                }

                Pattern priorityPattern = Pattern.compile("\"priority\"\\s*:\\s*(\\d+)");
                m = priorityPattern.matcher(aiResponse);
                if (m.find()) {
                    proposal.priority = Math.min(2, Math.max(0, Integer.parseInt(m.group(1))));
                    changed = true;
                }

                if (changed) {
                    return formatUpdatedProposal(proposal, "Cambios aplicados");
                }

            } catch (Exception e) {
                String errorCode = "ERR_DEEPSEEK_005";
                logger.error("[{}] Error procesando modificación con DeepSeek: {}", errorCode, e.getMessage());
                return "Error al interpretar los cambios [" + errorCode + "]. Por favor, intenta de nuevo con más detalle.";
            }
        }

        return "No entendí tu respuesta. Responde 'sí' para confirmar, 'no' para cancelar, o describe qué quieres modificar.";
    }

    /**
     * Formatea la propuesta actualizada
     */
    private String formatUpdatedProposal(PendingTaskProposal proposal, String changeMessage) {
        String priorityText = switch (proposal.priority) {
            case 0 -> "Baja";
            case 1 -> "Media";
            case 2 -> "Alta";
            default -> "Media";
        };

        LocalDate dueLocalDate;
        if (proposal.dueDate instanceof java.sql.Date) {
            dueLocalDate = ((java.sql.Date) proposal.dueDate).toLocalDate();
        } else {
            dueLocalDate = proposal.dueDate.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
        }

        return String.format("""
            ✏️ %s

            %s %s

            %s

            | Horas: %d | Prioridad: %s | %s |
            | Fecha límite: %s | Asignada a: %s |

            ¿Confirmas? (sí/no)
            """,
            changeMessage,
            proposal.taskCode,
            proposal.title,
            proposal.description,
            proposal.estimatedHours,
            priorityText,
            proposal.sprintName,
            dueLocalDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
            proposal.assignedUserName
        );
    }

    /**
     * Extrae la idea básica de tarea del mensaje del usuario
     */
    private String extractBasicTaskIdea(String message) {
        // Patrones para limpiar el mensaje y extraer solo la idea
        String[] prefixes = {
            "quiero crear una tarea:?\\s*",
            "quiero crear tarea:?\\s*",
            "crear una tarea:?\\s*",
            "crear tarea:?\\s*",
            "nueva tarea:?\\s*",
            "dar de alta:?\\s*",
            "agregar tarea:?\\s*",
            "añadir tarea:?\\s*",
            "quiero crear:?\\s*"
        };

        String idea = message;
        for (String prefix : prefixes) {
            idea = idea.replaceFirst("(?i)" + prefix, "");
        }

        // Limpiar palabras residuales comunes
        idea = idea.replaceFirst("(?i)^(una|un|la|el)\\s+", "");
        idea = idea.replaceFirst("(?i)^tarea\\s*", "");

        return idea.trim();
    }

    /**
     * Maneja la intención de asignar una tarea a un integrante
     */
    private String handleAssignTask(AppUser user, String userMessage) {
        try {
            // Obtener el equipo del usuario
            List<TeamMember> memberships = teamMemberService.getUserTeamMemberships(user.getId());
            if (memberships.isEmpty()) {
                return "Error: No perteneces a ningún equipo.";
            }
            Team team = memberships.get(0).getTeam();

            // Extraer nombre de la tarea y del usuario destino
            String[] extracted = extractTaskAndUser(userMessage);
            String taskKeyword = extracted[0];
            String targetUserName = extracted[1];

            if (taskKeyword == null || taskKeyword.isEmpty()) {
                return "No pude identificar qué tarea deseas asignar. Por favor, especifica el nombre de la tarea.";
            }

            if (targetUserName == null || targetUserName.isEmpty()) {
                return "No pude identificar a quién asignar la tarea. Por favor, usa el formato:\n" +
                       "\"Asignar la tarea [nombre] a [nombre del usuario]\"";
            }

            // Buscar la tarea en el equipo
            List<Task> teamTasks = taskService.getTasksByTeam(team.getId());
            Task matchedTask = null;

            for (Task task : teamTasks) {
                String taskTitle = task.getTitle().toLowerCase();
                if (taskTitle.contains(taskKeyword.toLowerCase()) ||
                    containsSignificantWords(taskKeyword.toLowerCase(), taskTitle)) {
                    matchedTask = task;
                    break;
                }
            }

            if (matchedTask == null) {
                StringBuilder sb = new StringBuilder();
                sb.append("No encontré una tarea que coincida con '").append(taskKeyword).append("'.\n\n");
                sb.append("Tareas disponibles en tu equipo:\n");
                for (Task task : teamTasks) {
                    String status = task.getStatus();
                    if (status == null || !status.equalsIgnoreCase("done")) {
                        sb.append("- ").append(task.getTitle() != null ? task.getTitle() : "Sin título").append("\n");
                    }
                }
                return sb.toString();
            }

            // Buscar el usuario destino
            List<AppUser> users = appUserService.searchUsersByName(targetUserName);
            if (users.isEmpty()) {
                // Intentar búsqueda más flexible
                List<AppUser> allUsers = appUserService.getAllUsers();
                for (AppUser u : allUsers) {
                    if (u.getFullName().toLowerCase().contains(targetUserName.toLowerCase()) ||
                        u.getUsername().toLowerCase().contains(targetUserName.toLowerCase())) {
                        users.add(u);
                    }
                }
            }

            if (users.isEmpty()) {
                return "No encontré ningún usuario con el nombre '" + targetUserName + "'.";
            }

            AppUser targetUser = users.get(0);

            // Asignar la tarea
            taskService.assignTask(matchedTask.getId(), targetUser.getId());
            logger.info("Usuario {} asignó tarea '{}' a {}", user.getUsername(), matchedTask.getTitle(), targetUser.getFullName());

            return "Tarea '" + matchedTask.getTitle() + "' asignada exitosamente a " + targetUser.getFullName() + ".";

        } catch (Exception e) {
            String errorCode = "ERR_TASK_ASSIGN_001";
            logger.error("[{}] Error al asignar tarea: {}", errorCode, e.getMessage());
            return "Error al asignar la tarea [" + errorCode + "]. Por favor, intenta de nuevo.";
        }
    }

    /**
     * Extrae el nombre de la tarea y el usuario destino del mensaje
     */
    private String[] extractTaskAndUser(String message) {
        String taskKeyword = null;
        String userName = null;

        // Buscar patrón "asignar [tarea] a [usuario]"
        Pattern pattern = Pattern.compile(
            "asignar\\s+(?:la\\s+)?(?:tarea\\s+)?(?:de\\s+)?[\"']?(.+?)[\"']?\\s+(?:a|para)\\s+(.+)",
            Pattern.CASE_INSENSITIVE
        );
        Matcher matcher = pattern.matcher(message);

        if (matcher.find()) {
            taskKeyword = matcher.group(1).trim();
            userName = matcher.group(2).trim();

            // Limpiar el nombre de la tarea
            taskKeyword = taskKeyword.replaceAll("(?i)^(la|el|una|un)\\s+", "");
        }

        return new String[]{taskKeyword, userName};
    }

    /**
     * Construye el contexto del usuario con sus datos actuales
     */
    /**
 * MÉTODO buildUserContext COMPLETAMENTE RECONSTRUIDO
 * 
 * Este método construye el contexto del usuario de forma SIMPLE y ROBUSTA
 * para evitar errores de NullPointer y asegurar que DeepSeek reciba la información correcta.
 */
private String buildUserContext(AppUser user) {
    logger.info("🔍 DEBUG - Construyendo contexto para usuario: {} (ID: {})", user.getUsername(), user.getId());
    
    StringBuilder context = new StringBuilder();
    
    try {
        // ========== INFORMACIÓN DEL USUARIO ==========
        context.append("=== INFORMACIÓN DEL USUARIO ===\n");
        context.append("Nombre: ").append(user.getFullName() != null ? user.getFullName() : "Sin nombre").append("\n");
        context.append("Usuario: ").append(user.getUsername()).append("\n");
        context.append("Fecha actual: ").append(LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))).append("\n\n");
        
        // ========== OBTENER TAREAS DEL USUARIO ==========
        List<Task> userTasks = taskService.getTasksByAssignedUser(user.getId());
        logger.info("🔍 DEBUG - Tareas encontradas: {}", userTasks.size());
        
        if (userTasks.isEmpty()) {
            context.append("=== TAREAS ===\n");
            context.append("El usuario no tiene tareas asignadas actualmente.\n\n");
            logger.info("🔍 DEBUG - No hay tareas para el usuario");
            return context.toString();
        }
        
        // ========== SEPARAR TAREAS POR ESTADO ==========
        List<Task> pendingTasks = userTasks.stream()
            .filter(t -> {
                String status = t.getStatus();
                if (status == null) return true;
                String statusLower = status.toLowerCase();
                return !statusLower.equals("done") && !statusLower.equals("cancelled");
            })
            .collect(Collectors.toList());
        
        List<Task> completedTasks = userTasks.stream()
            .filter(t -> t.getStatus() != null && t.getStatus().equalsIgnoreCase("done"))
            .collect(Collectors.toList());
        
        logger.info("🔍 DEBUG - Tareas pendientes: {}, Tareas completadas: {}", pendingTasks.size(), completedTasks.size());
        
        // ========== TAREAS PENDIENTES ==========
        context.append("=== TAREAS PENDIENTES ===\n");
        if (pendingTasks.isEmpty()) {
            context.append("No hay tareas pendientes.\n\n");
        } else {
            context.append("Total: ").append(pendingTasks.size()).append(" tarea(s)\n\n");
            
            int taskNumber = 1;
            for (Task task : pendingTasks) {
                // Número de tarea
                context.append(taskNumber++).append(". ");
                
                // Estado
                String status = task.getStatus();
                if (status != null) {
                    context.append("[").append(status.toUpperCase()).append("] ");
                }
                
                // Título
                String title = task.getTitle();
                context.append(title != null ? title : "Sin título");
                
                // Fecha límite
                if (task.getDueDate() != null) {
                    context.append("\n   Fecha límite: ").append(formatDate(task.getDueDate()));
                }
                
                // Sprint
                if (task.getSprint() != null && task.getSprint().getName() != null) {
                    context.append("\n   Sprint: ").append(task.getSprint().getName());
                }
                
                // Horas estimadas
                if (task.getEstimatedHours() != null) {
                    context.append("\n   Horas estimadas: ").append(task.getEstimatedHours());
                }
                
                context.append("\n\n");
            }
        }
        
        // ========== TAREAS COMPLETADAS ==========
        context.append("=== TAREAS COMPLETADAS ===\n");
        if (completedTasks.isEmpty()) {
            context.append("No hay tareas completadas.\n\n");
        } else {
            context.append("Total: ").append(completedTasks.size()).append(" tarea(s)\n\n");
            
            // Mostrar solo las primeras 5 completadas para no saturar el contexto
            int maxToShow = Math.min(5, completedTasks.size());
            for (int i = 0; i < maxToShow; i++) {
                Task task = completedTasks.get(i);
                
                context.append("- ").append(task.getTitle() != null ? task.getTitle() : "Sin título");
                
                if (task.getSprint() != null && task.getSprint().getName() != null) {
                    context.append(" (Sprint: ").append(task.getSprint().getName()).append(")");
                }
                
                context.append("\n");
            }
            
            if (completedTasks.size() > maxToShow) {
                context.append("... y ").append(completedTasks.size() - maxToShow).append(" más\n");
            }
            context.append("\n");
        }
        
        // ========== KPIs BÁSICOS ==========
        context.append("=== RESUMEN DE TRABAJO ===\n");
        
        // Calcular horas totales estimadas y trabajadas
        double totalEstimated = userTasks.stream()
            .filter(t -> t.getEstimatedHours() != null)
            .mapToDouble(Task::getEstimatedHours)
            .sum();
        
        double totalEffort = userTasks.stream()
            .filter(t -> t.getEffortHours() != null)
            .mapToDouble(Task::getEffortHours)
            .sum();
        
        context.append("Horas estimadas: ").append(String.format("%.1f", totalEstimated)).append(" hrs\n");
        context.append("Horas trabajadas: ").append(String.format("%.1f", totalEffort)).append(" hrs\n");
        
        if (totalEstimated > 0) {
            double efficiency = (totalEffort / totalEstimated) * 100;
            context.append("Eficiencia: ").append(String.format("%.1f", efficiency)).append("%\n");
        }
        
        context.append("Tareas completadas: ").append(completedTasks.size()).append(" de ").append(userTasks.size()).append("\n\n");
        
        // ========== TAREAS PRÓXIMAS A VENCER ==========
        List<Task> tasksWithDueDate = pendingTasks.stream()
            .filter(t -> t.getDueDate() != null)
            .sorted((t1, t2) -> t1.getDueDate().compareTo(t2.getDueDate()))
            .limit(3)
            .collect(Collectors.toList());
        
        if (!tasksWithDueDate.isEmpty()) {
            context.append("=== TAREAS PRÓXIMAS A VENCER ===\n");
            LocalDate today = LocalDate.now();
            
            for (Task task : tasksWithDueDate) {
                Date taskDueDate = task.getDueDate();
                LocalDate dueDate;
                
                if (taskDueDate instanceof java.sql.Date) {
                    dueDate = ((java.sql.Date) taskDueDate).toLocalDate();
                } else {
                    dueDate = taskDueDate.toInstant()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDate();
                }
                
                long daysUntilDue = ChronoUnit.DAYS.between(today, dueDate);
                
                context.append("- ").append(task.getTitle() != null ? task.getTitle() : "Sin título");
                context.append(" (").append(formatDate(task.getDueDate())).append(")");
                
                if (daysUntilDue < 0) {
                    context.append(" ⚠️ VENCIDA hace ").append(Math.abs(daysUntilDue)).append(" día(s)");
                } else if (daysUntilDue == 0) {
                    context.append(" ⚠️ VENCE HOY");
                } else if (daysUntilDue <= 3) {
                    context.append(" ⚠️ Vence en ").append(daysUntilDue).append(" día(s)");
                }
                
                context.append("\n");
            }
            context.append("\n");
        }
        
        // Log del contexto completo
        logger.info("🔍 DEBUG - CONTEXTO CONSTRUIDO EXITOSAMENTE");
        logger.info("================================================");
        logger.info("{}", context.toString());
        logger.info("================================================");
        
        return context.toString();
        
    } catch (Exception e) {
        logger.error("❌ ERROR construyendo contexto: {}", e.getMessage(), e);
        
        // En caso de error, devolver contexto mínimo pero funcional
        String fallbackContext = "=== INFORMACIÓN DEL USUARIO ===\n" +
            "Nombre: " + (user.getFullName() != null ? user.getFullName() : "Sin nombre") + "\n" +
            "Usuario: " + user.getUsername() + "\n" +
            "Fecha actual: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) + "\n\n" +
            "Error al cargar las tareas. Por favor, intenta de nuevo.\n";
        
        logger.warn("🔍 DEBUG - Usando contexto fallback debido a error");
        return fallbackContext;
    }
}

/**
 * Formatea una fecha de tipo Date a String legible
 */
private String formatDate(Date date) {
    if (date == null) return "Sin fecha";
    
    try {
        // Convertir java.sql.Date o java.util.Date a LocalDate
        LocalDate localDate;
        
        if (date instanceof java.sql.Date) {
            // Para java.sql.Date, usar toLocalDate() directamente
            localDate = ((java.sql.Date) date).toLocalDate();
        } else {
            // Para java.util.Date, usar toInstant()
            localDate = date.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
        }
        
        return localDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
    } catch (Exception e) {
        logger.warn("Error formateando fecha: {}", e.getMessage());
        return "Fecha inválida";
    }
}

    /**
     * Formatea una fecha java.util.Date
     */

    /**
     * Obtiene el usuario de una sesión activa
     */
    public Optional<AppUser> getSessionUser(Long chatId) {
        return Optional.ofNullable(activeSessions.get(chatId));
    }
}