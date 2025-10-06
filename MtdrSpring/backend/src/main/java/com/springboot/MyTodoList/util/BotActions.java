package com.springboot.MyTodoList.util;

import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.meta.generics.TelegramClient;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardRemove;
import com.springboot.MyTodoList.controller.ToDoItemBotController;
import com.springboot.MyTodoList.model.ToDoItem;
import com.springboot.MyTodoList.model.AppUser;
import com.springboot.MyTodoList.service.ToDoItemService;
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
import java.time.OffsetDateTime;
import java.util.Optional;

public class BotActions{

    private static final Logger logger = LoggerFactory.getLogger(BotActions.class);

    String requestText;
    long chatId;
    TelegramClient telegramClient;
    boolean exit;
    ToDoItemService todoService;
    AppUserService appUserService;

    public BotActions(TelegramClient tc, ToDoItemService ts){
        telegramClient = tc;
        todoService = ts;
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

    public void setTodoService(ToDoItemService tsvc){
        todoService = tsvc;
    }

    public void setAppUserService(AppUserService ausvc){
        appUserService = ausvc;
    }

    public ToDoItemService getTodoService(){
        return todoService;
    }

    public void fnStart() {
        if (!(requestText.equals(BotCommands.START_COMMAND.getCommand()) || requestText.equals(BotLabels.SHOW_MAIN_SCREEN.getLabel())) || exit)
            return;

        BotHelper.sendMessageToTelegram(chatId, BotMessages.HELLO_MYTODO_BOT.getMessage(), telegramClient, ReplyKeyboardMarkup
            .builder()
            .keyboardRow(new KeyboardRow(BotLabels.LIST_ALL_ITEMS.getLabel(), BotLabels.ADD_NEW_ITEM.getLabel()))
            .keyboardRow(new KeyboardRow(BotLabels.USER_LIST.getLabel(), BotLabels.ADD_NEW_USER.getLabel()))
            .keyboardRow(new KeyboardRow(BotLabels.SHOW_MAIN_SCREEN.getLabel(), BotLabels.HIDE_MAIN_SCREEN.getLabel()))
            .build()
        );
        exit = true;
    }

    public void fnDone() {
        if (!(requestText.indexOf(BotLabels.DONE.getLabel()) != -1) || exit)
            return;

        String done = requestText.substring(0, requestText.indexOf(BotLabels.DASH.getLabel()));
        Integer id = Integer.valueOf(done);
        try {
            ToDoItem item = todoService.getToDoItemById(id);
            item.setDone(true);
            todoService.updateToDoItem(id, item);
            BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_DONE.getMessage(), telegramClient);
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
        }
        exit = true;
    }

    public void fnUndo() {
        if (requestText.indexOf(BotLabels.UNDO.getLabel()) == -1 || exit)
            return;

        String undo = requestText.substring(0, requestText.indexOf(BotLabels.DASH.getLabel()));
        Integer id = Integer.valueOf(undo);
        try {
            ToDoItem item = todoService.getToDoItemById(id);
            item.setDone(false);
            todoService.updateToDoItem(id, item);
            BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_UNDONE.getMessage(), telegramClient);
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
        }
        exit = true;
    }

    public void fnDelete(){
        if (requestText.indexOf(BotLabels.DELETE.getLabel()) == -1 || exit)
            return;

        String delete = requestText.substring(0, requestText.indexOf(BotLabels.DASH.getLabel()));
        Integer id = Integer.valueOf(delete);
        try {
            todoService.deleteToDoItem(id);
            BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_DELETED.getMessage(), telegramClient);
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
        }
        exit = true;
    }

    public void fnHide(){
        if (requestText.equals(BotCommands.HIDE_COMMAND.getCommand())
            || requestText.equals(BotLabels.HIDE_MAIN_SCREEN.getLabel()) && !exit)
            BotHelper.sendMessageToTelegram(chatId, BotMessages.BYE.getMessage(), telegramClient);
        else
            return;
        exit = true;
    }

    public void fnListAll(){
        if (!(requestText.equals(BotCommands.TODO_LIST.getCommand())
            || requestText.equals(BotLabels.LIST_ALL_ITEMS.getLabel())
            || requestText.equals(BotLabels.MY_TODO_LIST.getLabel())) || exit)
            return;

        logger.info("todoSvc: " + todoService);
        List<ToDoItem> allItems = todoService.findAll();

        ReplyKeyboardMarkup keyboardMarkup = ReplyKeyboardMarkup.builder()
            .resizeKeyboard(true)
            .oneTimeKeyboard(false)
            .selective(true)
            .build();

        List<KeyboardRow> keyboard = new ArrayList<>();

        // command back to main screen
        KeyboardRow mainScreenRowTop = new KeyboardRow();
        mainScreenRowTop.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
        keyboard.add(mainScreenRowTop);

        KeyboardRow firstRow = new KeyboardRow();
        firstRow.add(BotLabels.ADD_NEW_ITEM.getLabel());
        keyboard.add(firstRow);

        KeyboardRow myTodoListTitleRow = new KeyboardRow();
        myTodoListTitleRow.add(BotLabels.MY_TODO_LIST.getLabel());
        keyboard.add(myTodoListTitleRow);

        List<ToDoItem> activeItems = allItems.stream().filter(item -> item.isDone() == false)
            .collect(Collectors.toList());

        for (ToDoItem item : activeItems) {
            KeyboardRow currentRow = new KeyboardRow();
            currentRow.add(item.getDescription());
            currentRow.add(item.getID() + BotLabels.DASH.getLabel() + BotLabels.DONE.getLabel());
            keyboard.add(currentRow);
        }

        List<ToDoItem> doneItems = allItems.stream().filter(item -> item.isDone() == true)
            .collect(Collectors.toList());

        for (ToDoItem item : doneItems) {
            KeyboardRow currentRow = new KeyboardRow();
            currentRow.add(item.getDescription());
            currentRow.add(item.getID() + BotLabels.DASH.getLabel() + BotLabels.UNDO.getLabel());
            currentRow.add(item.getID() + BotLabels.DASH.getLabel() + BotLabels.DELETE.getLabel());
            keyboard.add(currentRow);
        }

        // command back to main screen
        KeyboardRow mainScreenRowBottom = new KeyboardRow();
        mainScreenRowBottom.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
        keyboard.add(mainScreenRowBottom);

        keyboardMarkup.setKeyboard(keyboard);
        BotHelper.sendMessageToTelegram(chatId, BotLabels.MY_TODO_LIST.getLabel(), telegramClient, keyboardMarkup);
        exit = true;
    }

    public void fnAddItem(){
        logger.info("Adding item");
        if (!(requestText.contains(BotCommands.ADD_ITEM.getCommand())
            || requestText.contains(BotLabels.ADD_NEW_ITEM.getLabel())) || exit )
            return;

        logger.info("Adding item by BotHelper");
        BotHelper.sendMessageToTelegram(chatId, BotMessages.TYPE_NEW_TODO_ITEM.getMessage(), telegramClient);
        exit = true;
    }

    // ========== NUEVAS FUNCIONES PARA APPUSER ==========

    public void fnUsersList() {
        if (!(requestText.equals(BotCommands.USERS.getCommand()) || requestText.equals(BotLabels.USER_LIST.getLabel())) || exit)
            return;

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

        // Título y navegación
        KeyboardRow mainScreenRowTop = new KeyboardRow();
        mainScreenRowTop.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
        keyboard.add(mainScreenRowTop);

        KeyboardRow titleRow = new KeyboardRow();
        titleRow.add(BotLabels.USER_LIST.getLabel());
        keyboard.add(titleRow);

        KeyboardRow addRow = new KeyboardRow();
        addRow.add(BotLabels.ADD_NEW_USER.getLabel());
        keyboard.add(addRow);

        // Lista de usuarios
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
            String info = "User: " + found.getUsername() + 
                         "\nEmail: " + found.getEmail() + 
                         "\nFull Name: " + found.getFullName() + 
                         "\nPhone: " + found.getPhone() + 
                         "\nStatus: " + found.getStatus();
            BotHelper.sendMessageToTelegram(chatId, info, telegramClient, null);
        }
        exit = true;
    }

    public void fnUsersByStatus() {
        if (!requestText.startsWith(BotCommands.STATUS.getCommand()) || exit)
            return;

        if (appUserService == null) {
            BotHelper.sendMessageToTelegram(chatId, "Service not available", telegramClient, null);
            exit = true;
            return;
        }

        String status = requestText.substring(BotCommands.STATUS.getCommand().length()).trim();
        List<AppUser> users = appUserService.getUsersByStatus(status);

        String msg = users.isEmpty() ? "No users with status: " + status : 
            users.stream().map(u -> u.getUsername() + " (" + u.getStatus() + ")").collect(Collectors.joining("\n"));
        
        BotHelper.sendMessageToTelegram(chatId, msg, telegramClient, null);
        exit = true;
    }

    public void fnAddUser() {
        if (!(requestText.equals(BotCommands.ADDUSER.getCommand()) || requestText.equals(BotLabels.ADD_NEW_USER.getLabel())) || exit)
            return;

        BotHelper.sendMessageToTelegram(chatId, BotMessages.TYPE_NEW_USER.getMessage(), telegramClient, null);
        exit = true;
    }

    public void fnDeleteUser() {
        if (requestText.indexOf(BotLabels.DELETE_USER.getLabel()) == -1 || exit)
            return;

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

    public void fnElse(){
        if(exit)
            return;

        // ACTUALIZADO: Verificar si es un CSV para crear usuario con 6 campos incluyendo PASSWORD
        if (requestText.contains(",") && requestText.split(",").length >= 6) {
            String[] parts = requestText.split(",");
            if (parts.length >= 6) {
                try {
                    AppUser newUser = AppUser.builder()
                        .username(parts[0].trim())
                        .email(parts[1].trim())
                        .fullName(parts[2].trim())
                        .phone(parts[3].trim())
                        .password(parts[4].trim())  // NUEVO CAMPO
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
        }

        // Lógica original para crear ToDo Item
        ToDoItem newItem = new ToDoItem();
        newItem.setDescription(requestText);
        newItem.setCreation_ts(OffsetDateTime.now());
        newItem.setDone(false);
        todoService.addToDoItem(newItem);
        BotHelper.sendMessageToTelegram(chatId, BotMessages.NEW_ITEM_ADDED.getMessage(), telegramClient, null);
    }
}