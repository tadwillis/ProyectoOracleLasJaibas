package com.springboot.MyTodoList.util;

public enum BotMessages {

    HELLO_MYTODO_BOT(
        "Hello! I'm MyTodoList Bot!\nType a new todo item below and press the send button (blue arrow), or select an option below:"),
    BOT_REGISTERED_STARTED("Bot registered and started successfully!"),
    ITEM_DONE("Item done! Select /todolist to return to the list of todo items, or /start to go to the main screen."),
    ITEM_UNDONE("Item undone! Select /todolist to return to the list of todo items, or /start to go to the main screen."),
    ITEM_DELETED("Item deleted! Select /todolist to return to the list of todo items, or /start to go to the main screen."),
    TYPE_NEW_TODO_ITEM("Type a new todo item below and press the send button (blue arrow) on the right-hand side."),
    NEW_ITEM_ADDED("New item added! Select /todolist to return to the list of todo items, or /start to go to the main screen."),
    BYE("Bye! Select /start to resume!"),
    
    // Mensajes para AppUser - ACTUALIZADO CON PASSWORD
    USERS_TITLE("USERS"),
    TYPE_NEW_USER("Type: username,email,fullName,phone,password,status (separated by commas)"),
    USER_CREATED("User created! Select /users to return to the user list, or /start to go to the main screen."),
    USER_DELETED("User deleted! Select /users to return to the user list, or /start to go to the main screen."),
    USER_NOT_FOUND("User not found."),
    DUPLICATE_USER("Username or email already exists."),
    TYPE_YOUR_USERNAME("Type your username to check-in:");

    private String message;

    BotMessages(String enumMessage) {
        this.message = enumMessage;
    }

    public String getMessage() {
        return message;
    }
}