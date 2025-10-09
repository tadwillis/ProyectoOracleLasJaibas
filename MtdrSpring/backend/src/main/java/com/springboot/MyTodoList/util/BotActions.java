package com.springboot.MyTodoList.util;

import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.meta.generics.TelegramClient;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardRemove;
import com.springboot.MyTodoList.controller.ToDoItemBotController;
import com.springboot.MyTodoList.model.Task;
import com.springboot.MyTodoList.model.AppUser;
import com.springboot.MyTodoList.service.TaskService;
import com.springboot.MyTodoList.service.AppUserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.springboot.MyTodoList.util.BotCommands;
import com.springboot.MyTodoList.util.BotHelper;
import com.springboot.MyTodoList.util.BotLabels;
import com.springboot.MyTodoList.util.BotMessages;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.ConcurrentHashMap;

public class BotActions{

    private static final Logger logger = LoggerFactory.getLogger(BotActions.class);

    // NUEVO: Mapas para manejar sesiones de usuario
    private static final Map<Long, Long> loggedUsers = new ConcurrentHashMap<>(); // chatId -> userId
    private static final Map<Long, String> loginState = new ConcurrentHashMap<>(); // chatId -> "username" o "password"
    private static final Map<Long, String> tempUsername = new ConcurrentHashMap<>(); // chatId -> username temporal

    String requestText;
    long chatId;
    TelegramClient telegramClient;
    boolean exit;
    TaskService taskService;
    AppUserService appUserService;

    public BotActions(TelegramClient tc, TaskService ts){
        telegramClient = tc;
        taskService = ts;
        exit = false;
    }

    public void setRequestText(String cmd){
        requestText = cmd;
    }

    public void setChatId(long chId){
        chatId = chId;
    }

    public void setTelegramClient(TelegramClient tc){
        telegramClient = tc;
    }

    public void setTaskService(TaskService tsvc){
        taskService = tsvc;
    }

    public void setAppUserService(AppUserService ausvc){
        appUserService = ausvc;
    }

    public TaskService getTaskService(){
        return taskService;
    }

    // NUEVO: Métodos de autenticación
    private boolean isUserAuthenticated() {
        return loggedUsers.containsKey(chatId);
    }

    private Long getAuthenticatedUserId() {
        return loggedUsers.get(chatId);
    }

    private void authenticateUser(Long userId) {
        loggedUsers.put(chatId, userId);
        loginState.remove(chatId);
        tempUsername.remove(chatId);
    }

    private void logout() {
        loggedUsers.remove(chatId);
        loginState.remove(chatId);
        tempUsername.remove(chatId);
    }

    // MODIFICADO: fnStart ahora maneja autenticación
    public void fnStart() {
        if (!(requestText.equals(BotCommands.START_COMMAND.getCommand()) || requestText.equals(BotLabels.SHOW_MAIN_SCREEN.getLabel())) || exit)
            return;

        // Si no está autenticado, solicitar login
        if (!isUserAuthenticated()) {
            loginState.put(chatId, "username");
            BotHelper.sendMessageToTelegram(chatId, BotMessages.LOGIN_REQUIRED.getMessage(), telegramClient, null);
            exit = true;
            return;
        }

        // Si está autenticado, mostrar menú principal
        BotHelper.sendMessageToTelegram(chatId, BotMessages.HELLO_MYTODO_BOT.getMessage(), telegramClient, ReplyKeyboardMarkup
            .builder()
            .keyboardRow(new KeyboardRow(BotLabels.LIST_ALL_ITEMS.getLabel(), BotLabels.ADD_NEW_ITEM.getLabel()))
            .keyboardRow(new KeyboardRow(BotLabels.USER_LIST.getLabel(), BotLabels.ADD_NEW_USER.getLabel()))
            .keyboardRow(new KeyboardRow(BotLabels.SHOW_MAIN_SCREEN.getLabel(), BotLabels.HIDE_MAIN_SCREEN.getLabel()))
            .build()
        );
        exit = true;
    }

    public void fnHide(){
        if (requestText.equals(BotCommands.HIDE_COMMAND.getCommand())
            || requestText.equals(BotLabels.HIDE_MAIN_SCREEN.getLabel()) && !exit) {
            logout(); // Cerrar sesión al ocultar
            BotHelper.sendMessageToTelegram(chatId, BotMessages.LOGOUT_SUCCESS.getMessage(), telegramClient);
        } else
            return;
        exit = true;
    }

    // MODIFICADO: fnListAll ahora filtra por usuario autenticado
    public void fnListAll(){
        if (!(requestText.equals(BotCommands.TODO_LIST.getCommand())
            || requestText.equals(BotLabels.LIST_ALL_ITEMS.getLabel())
            || requestText.equals(BotLabels.MY_TODO_LIST.getLabel())) || exit)
            return;

        // Verificar autenticación
        if (!isUserAuthenticated()) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.NOT_AUTHENTICATED.getMessage(), telegramClient, null);
            loginState.put(chatId, "username");
            exit = true;
            return;
        }

        logger.info("taskService: " + taskService);
        Long userId = getAuthenticatedUserId();
        
        // MODIFICADO: Obtener solo las tareas del usuario autenticado
        List<Task> userTasks = taskService.getTasksByUserId(userId);

        ReplyKeyboardMarkup keyboardMarkup = ReplyKeyboardMarkup.builder()
            .resizeKeyboard(true)
            .oneTimeKeyboard(false)
            .selective(true)
            .build();

        List<KeyboardRow> keyboard = new ArrayList<>();

        KeyboardRow mainScreenRowTop = new KeyboardRow();
        mainScreenRowTop.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
        keyboard.add(mainScreenRowTop);

        KeyboardRow firstRow = new KeyboardRow();
        firstRow.add(BotLabels.ADD_NEW_ITEM.getLabel());
        keyboard.add(firstRow);

        KeyboardRow myTodoListTitleRow = new KeyboardRow();
        myTodoListTitleRow.add(BotLabels.MY_TODO_LIST.getLabel());
        keyboard.add(myTodoListTitleRow);

        List<Task> todoTasks = userTasks.stream().filter(task -> "todo".equals(task.getStatus()))
            .collect(Collectors.toList());

        for (Task task : todoTasks) {
            KeyboardRow currentRow = new KeyboardRow();
            currentRow.add("ID:" + task.getId() + " - " + task.getTitle());
            currentRow.add(task.getId() + BotLabels.DASH.getLabel() + "DONE");
            keyboard.add(currentRow);
        }

        List<Task> doneTasks = userTasks.stream().filter(task -> "done".equals(task.getStatus()))
            .collect(Collectors.toList());

        for (Task task : doneTasks) {
            KeyboardRow currentRow = new KeyboardRow();
            currentRow.add("ID:" + task.getId() + " - " + task.getTitle());
            currentRow.add(task.getId() + BotLabels.DASH.getLabel() + "UNDO");
            currentRow.add(task.getId() + BotLabels.DASH.getLabel() + "DELETE");
            keyboard.add(currentRow);
        }

        KeyboardRow mainScreenRowBottom = new KeyboardRow();
        mainScreenRowBottom.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
        keyboard.add(mainScreenRowBottom);

        keyboardMarkup.setKeyboard(keyboard);
        BotHelper.sendMessageToTelegram(chatId, BotLabels.MY_TODO_LIST.getLabel(), telegramClient, keyboardMarkup);
        exit = true;
    }

    // MODIFICADO: fnAddItem ahora requiere autenticación
    public void fnAddItem(){
        logger.info("Adding task");
        if (!(requestText.contains(BotCommands.ADD_ITEM.getCommand())
            || requestText.contains(BotLabels.ADD_NEW_ITEM.getLabel())) || exit )
            return;

        // Verificar autenticación
        if (!isUserAuthenticated()) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.NOT_AUTHENTICATED.getMessage(), telegramClient, null);
            loginState.put(chatId, "username");
            exit = true;
            return;
        }

        logger.info("Adding task by BotHelper");
        BotHelper.sendMessageToTelegram(chatId, BotMessages.TYPE_NEW_TODO_ITEM.getMessage(), telegramClient);
        exit = true;
    }

    public void fnDone() {
        if (!(requestText.indexOf("DONE") != -1) || exit)
            return;

        // Verificar autenticación
        if (!isUserAuthenticated()) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.NOT_AUTHENTICATED.getMessage(), telegramClient, null);
            exit = true;
            return;
        }

        String done = requestText.substring(0, requestText.indexOf(BotLabels.DASH.getLabel()));
        Long id = Long.valueOf(done);
        try {
            taskService.updateTaskStatus(id, "done");
            BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_DONE.getMessage(), telegramClient);
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
        }
        exit = true;
    }

    public void fnUndo() {
        if (requestText.indexOf("UNDO") == -1 || exit)
            return;

        // Verificar autenticación
        if (!isUserAuthenticated()) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.NOT_AUTHENTICATED.getMessage(), telegramClient, null);
            exit = true;
            return;
        }

        String undo = requestText.substring(0, requestText.indexOf(BotLabels.DASH.getLabel()));
        Long id = Long.valueOf(undo);
        try {
            taskService.updateTaskStatus(id, "todo");
            BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_UNDONE.getMessage(), telegramClient);
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
        }
        exit = true;
    }

    public void fnDelete(){
        if (requestText.indexOf("DELETE") == -1 || exit)
            return;

        // Verificar autenticación
        if (!isUserAuthenticated()) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.NOT_AUTHENTICATED.getMessage(), telegramClient, null);
            exit = true;
            return;
        }

        String delete = requestText.substring(0, requestText.indexOf(BotLabels.DASH.getLabel()));
        Long id = Long.valueOf(delete);
        try {
            taskService.deleteTask(id);
            BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_DELETED.getMessage(), telegramClient);
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
        }
        exit = true;
    }

    // ========== FUNCIONES PARA APPUSER (REQUIEREN AUTENTICACIÓN) ==========

    public void fnUsersList() {
        if (!(requestText.equals(BotCommands.USERS.getCommand()) || requestText.equals(BotLabels.USER_LIST.getLabel())) || exit)
            return;

        // Verificar autenticación
        if (!isUserAuthenticated()) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.NOT_AUTHENTICATED.getMessage(), telegramClient, null);
            loginState.put(chatId, "username");
            exit = true;
            return;
        }

        if (appUserService == null) {
            BotHelper.sendMessageToTelegram(chatId, "Service not available", telegramClient, null);
            exit = true;
            return;
        }

        List<AppUser> users = appUserService.getAllUsers();
        ReplyKeyboardMarkup keyboardMarkup = ReplyKeyboardMarkup.builder()
            .resizeKeyboard(true)
            .oneTimeKeyboard(false)
            .selective(true)
            .build();

        List<KeyboardRow> keyboard = new ArrayList<>();

        KeyboardRow mainScreenRowTop = new KeyboardRow();
        mainScreenRowTop.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
        keyboard.add(mainScreenRowTop);

        KeyboardRow titleRow = new KeyboardRow();
        titleRow.add(BotLabels.USER_LIST.getLabel());
        keyboard.add(titleRow);

        KeyboardRow addRow = new KeyboardRow();
        addRow.add(BotLabels.ADD_NEW_USER.getLabel());
        keyboard.add(addRow);

        for (AppUser user : users) {
            KeyboardRow userRow = new KeyboardRow();
            String username = user.getUsername() != null ? user.getUsername() : "user" + user.getId();
            userRow.add(username + " (" + user.getStatus() + ")");
            userRow.add(user.getId() + BotLabels.DASH.getLabel() + BotLabels.DELETE_USER.getLabel());
            keyboard.add(userRow);
        }

        KeyboardRow mainScreenRowBottom = new KeyboardRow();
        mainScreenRowBottom.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
        keyboard.add(mainScreenRowBottom);

        keyboardMarkup.setKeyboard(keyboard);
        BotHelper.sendMessageToTelegram(chatId, BotMessages.USERS_TITLE.getMessage(), telegramClient, keyboardMarkup);
        exit = true;
    }

    public void fnUserBy() {
        if (!requestText.startsWith(BotCommands.USERBY.getCommand()) || exit)
            return;

        // Verificar autenticación
        if (!isUserAuthenticated()) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.NOT_AUTHENTICATED.getMessage(), telegramClient, null);
            exit = true;
            return;
        }

        if (appUserService == null) {
            BotHelper.sendMessageToTelegram(chatId, "Service not available", telegramClient, null);
            exit = true;
            return;
        }

        String query = requestText.substring(BotCommands.USERBY.getCommand().length()).trim();
        AppUser found = null;

        if (query.startsWith("username ")) {
            String username = query.substring(9).trim();
            Optional<AppUser> userOpt = appUserService.getUserByUsername(username);
            found = userOpt.orElse(null);
        } else if (query.startsWith("email ")) {
            String email = query.substring(6).trim();
            Optional<AppUser> userOpt = appUserService.getUserByEmail(email);
            found = userOpt.orElse(null);
        }

        if (found == null) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.USER_NOT_FOUND.getMessage(), telegramClient, null);
        } else {
            String info = "🆔 ID: " + found.getId() + 
                         "\n👤 User: " + found.getUsername() + 
                         "\n📧 Email: " + found.getEmail() + 
                         "\n📝 Full Name: " + found.getFullName() + 
                         "\n📱 Phone: " + found.getPhone() + 
                         "\n📊 Status: " + found.getStatus();
            BotHelper.sendMessageToTelegram(chatId, info, telegramClient, null);
        }
        exit = true;
    }

    public void fnUsersByStatus() {
        if (!requestText.startsWith(BotCommands.STATUS.getCommand()) || exit)
            return;

        // Verificar autenticación
        if (!isUserAuthenticated()) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.NOT_AUTHENTICATED.getMessage(), telegramClient, null);
            exit = true;
            return;
        }

        if (appUserService == null) {
            BotHelper.sendMessageToTelegram(chatId, "Service not available", telegramClient, null);
            exit = true;
            return;
        }

        String status = requestText.substring(BotCommands.STATUS.getCommand().length()).trim();
        List<AppUser> users = appUserService.getUsersByStatus(status);

        String msg = users.isEmpty() ? "No users with status: " + status : 
            users.stream().map(u -> u.getUsername() + " (ID:" + u.getId() + " - " + u.getStatus() + ")").collect(Collectors.joining("\n"));
        
        BotHelper.sendMessageToTelegram(chatId, msg, telegramClient, null);
        exit = true;
    }

    public void fnAddUser() {
        if (!(requestText.equals(BotCommands.ADDUSER.getCommand()) || requestText.equals(BotLabels.ADD_NEW_USER.getLabel())) || exit)
            return;

        // Verificar autenticación
        if (!isUserAuthenticated()) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.NOT_AUTHENTICATED.getMessage(), telegramClient, null);
            exit = true;
            return;
        }

        BotHelper.sendMessageToTelegram(chatId, BotMessages.TYPE_NEW_USER.getMessage(), telegramClient, null);
        exit = true;
    }

    public void fnDeleteUser() {
        if (requestText.indexOf(BotLabels.DELETE_USER.getLabel()) == -1 || exit)
            return;

        // Verificar autenticación
        if (!isUserAuthenticated()) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.NOT_AUTHENTICATED.getMessage(), telegramClient, null);
            exit = true;
            return;
        }

        if (appUserService == null) {
            BotHelper.sendMessageToTelegram(chatId, "Service not available", telegramClient, null);
            exit = true;
            return;
        }

        String delete = requestText.substring(0, requestText.indexOf(BotLabels.DASH.getLabel()));
        try {
            Long id = Long.valueOf(delete);
            appUserService.deleteUser(id);
            BotHelper.sendMessageToTelegram(chatId, BotMessages.USER_DELETED.getMessage(), telegramClient, null);
        } catch (Exception e) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.USER_NOT_FOUND.getMessage(), telegramClient, null);
            logger.error(e.getLocalizedMessage(), e);
        }
        exit = true;
    }

    public void fnMe() {
        if (!requestText.equals(BotCommands.ME.getCommand()) || exit)
            return;

        BotHelper.sendMessageToTelegram(chatId, BotMessages.TYPE_YOUR_USERNAME.getMessage(), telegramClient, null);
        exit = true;
    }

    // Helper methods (sin cambios)
    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty() || "null".equalsIgnoreCase(dateStr.trim())) {
            return null;
        }
        try {
            return LocalDate.parse(dateStr.trim(), DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        } catch (DateTimeParseException e) {
            logger.warn("Failed to parse date: " + dateStr);
            return null;
        }
    }

    private Double parseDouble(String str) {
        if (str == null || str.trim().isEmpty() || "null".equalsIgnoreCase(str.trim())) {
            return null;
        }
        try {
            return Double.parseDouble(str.trim());
        } catch (NumberFormatException e) {
            logger.warn("Failed to parse double: " + str);
            return null;
        }
    }

    private Integer parseInt(String str) {
        if (str == null || str.trim().isEmpty() || "null".equalsIgnoreCase(str.trim())) {
            return 0;
        }
        try {
            return Integer.parseInt(str.trim());
        } catch (NumberFormatException e) {
            logger.warn("Failed to parse integer: " + str);
            return 0;
        }
    }

    // MODIFICADO: formatTaskDetails ahora incluye usuario asignado
    private String formatTaskDetails(Task task) {
        StringBuilder sb = new StringBuilder();
        sb.append("📋 **TAREA CREADA:**\n\n");
        sb.append("🆔 **ID:** ").append(task.getId()).append("\n");
        sb.append("📝 **Título:** ").append(task.getTitle()).append("\n");
        
        if (task.getDescription() != null && !task.getDescription().isEmpty()) {
            sb.append("📄 **Descripción:** ").append(task.getDescription()).append("\n");
        }
        
        sb.append("📊 **Estado:** ").append(task.getStatus()).append("\n");
        sb.append("⚡ **Prioridad:** ").append(task.getPriority()).append("\n");
        
        if (task.getEstimatedHours() != null) {
            sb.append("⏰ **Horas Estimadas:** ").append(task.getEstimatedHours()).append("\n");
        }
        
        if (task.getStartDate() != null) {
            sb.append("📅 **Fecha Inicio:** ").append(task.getStartDate()).append("\n");
        }
        
        if (task.getEndDate() != null) {
            sb.append("📅 **Fecha Fin:** ").append(task.getEndDate()).append("\n");
        }
        
        if (task.getStory() != null) {
            sb.append("📖 **Story ID:** ").append(task.getStory().getId()).append("\n");
        }
        
        if (task.getTeam() != null) {
            sb.append("👥 **Team ID:** ").append(task.getTeam().getId()).append("\n");
        }

        // NUEVO: Mostrar usuario asignado
        if (task.getAssignedUser() != null) {
            sb.append("👤 **Asignado a:** ").append(task.getAssignedUser().getUsername()).append(" (ID: ").append(task.getAssignedUser().getId()).append(")\n");
        }
        
        sb.append("\nSelecciona /todolist para ver todas tus tareas, o /start para ir al menú principal.");
        
        return sb.toString();
    }

    // MODIFICADO: fnElse ahora maneja login y asigna tareas automáticamente
    public void fnElse(){
        if(exit)
            return;

        // NUEVO: Manejar flujo de login
        String currentState = loginState.get(chatId);
        if ("username".equals(currentState)) {
            // Usuario ingresó su nombre de usuario
            tempUsername.put(chatId, requestText.trim());
            loginState.put(chatId, "password");
            BotHelper.sendMessageToTelegram(chatId, BotMessages.LOGIN_ENTER_PASSWORD.getMessage(), telegramClient, null);
            exit = true;
            return;
        } else if ("password".equals(currentState)) {
            // Usuario ingresó su contraseña
            String username = tempUsername.get(chatId);
            String password = requestText.trim();
            
            if (appUserService != null) {
                Optional<AppUser> userOpt = appUserService.login(username, password);
                if (userOpt.isPresent()) {
                    AppUser user = userOpt.get();
                    authenticateUser(user.getId());
                    
                    // Formatear mensaje de login exitoso con datos del usuario
                    String successMsg = BotMessages.LOGIN_SUCCESS.getMessage()
                        .replace("{ID}", String.valueOf(user.getId()))
                        .replace("{USERNAME}", user.getUsername())
                        .replace("{EMAIL}", user.getEmail())
                        .replace("{FULLNAME}", user.getFullName())
                        .replace("{PHONE}", user.getPhone())
                        .replace("{STATUS}", user.getStatus());
                    
                    BotHelper.sendMessageToTelegram(chatId, successMsg, telegramClient, null);
                } else {
                    BotHelper.sendMessageToTelegram(chatId, BotMessages.LOGIN_FAILED.getMessage(), telegramClient, null);
                    loginState.put(chatId, "username");
                }
            } else {
                BotHelper.sendMessageToTelegram(chatId, "Service not available", telegramClient, null);
            }
            exit = true;
            return;
        }

        // Verificar autenticación para operaciones que requieren login
        if (!isUserAuthenticated()) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.NOT_AUTHENTICATED.getMessage(), telegramClient, null);
            loginState.put(chatId, "username");
            exit = true;
            return;
        }

        // Verificar si es un CSV para crear usuario con 6 campos
        if (requestText.contains(",") && requestText.split(",").length >= 6) {
            String[] parts = requestText.split(",");
            
            if (parts.length == 6) {
                try {
                    AppUser newUser = AppUser.builder()
                        .username(parts[0].trim())
                        .email(parts[1].trim())
                        .fullName(parts[2].trim())
                        .phone(parts[3].trim())
                        .password(parts[4].trim())
                        .status(parts[5].trim())
                        .build();
                    
                    if (appUserService != null) {
                        appUserService.createUser(newUser);
                        BotHelper.sendMessageToTelegram(chatId, BotMessages.USER_CREATED.getMessage(), telegramClient, null);
                        return;
                    }
                } catch (IllegalArgumentException ex) {
                    BotHelper.sendMessageToTelegram(chatId, BotMessages.DUPLICATE_USER.getMessage(), telegramClient, null);
                    return;
                } catch (Exception ex) {
                    BotHelper.sendMessageToTelegram(chatId, "Error creating user: " + ex.getMessage(), telegramClient, null);
                    return;
                }
            }
            
            // Si tiene 9 campos, es una tarea completa
            if (parts.length >= 9) {
                try {
                    Task newTask = Task.builder()
                        .title(parts[0].trim())
                        .description(parts[1].trim().equals("null") ? null : parts[1].trim())
                        .priority(parseInt(parts[4]))
                        .status(parts[5].trim().isEmpty() ? "todo" : parts[5].trim())
                        .estimatedHours(parseDouble(parts[6]))
                        .startDate(parseDate(parts[7]))
                        .endDate(parseDate(parts[8]))
                        .createdAt(LocalDateTime.now())
                        .build();
                    
                    Long storyId = Long.valueOf(parts[2].trim());
                    Long teamId = Long.valueOf(parts[3].trim());
                    
                    // NUEVO: Asignar automáticamente al usuario autenticado
                    Long assignedUserId = getAuthenticatedUserId();
                    Task createdTask = taskService.createTaskWithAssignedUser(newTask, storyId, teamId, assignedUserId);
                    
                    String taskDetails = formatTaskDetails(createdTask);
                    BotHelper.sendMessageToTelegram(chatId, taskDetails, telegramClient, null);
                    return;
                    
                } catch (NumberFormatException ex) {
                    BotHelper.sendMessageToTelegram(chatId, "❌ Error: Los campos storyId y teamId deben ser números válidos.", telegramClient, null);
                    return;
                } catch (Exception ex) {
                    BotHelper.sendMessageToTelegram(chatId, "❌ Error creating task: " + ex.getMessage(), telegramClient, null);
                    logger.error(ex.getLocalizedMessage(), ex);
                    return;
                }
            }
        }

        // MODIFICADO: Crear tarea simple asignada automáticamente al usuario autenticado
        Task newTask = Task.builder()
            .title(requestText)
            .status("todo")
            .priority(0)
            .createdAt(LocalDateTime.now())
            .build();
        
        try {
            Long assignedUserId = getAuthenticatedUserId();
            Task createdTask = taskService.createTaskWithAssignedUser(newTask, 1L, 1L, assignedUserId);
            String taskDetails = formatTaskDetails(createdTask);
            BotHelper.sendMessageToTelegram(chatId, taskDetails, telegramClient, null);
        } catch (Exception e) {
            BotHelper.sendMessageToTelegram(chatId, "❌ Error creating task: " + e.getMessage(), telegramClient, null);
            logger.error(e.getLocalizedMessage(), e);
        }
    }
}