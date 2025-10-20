package com.springboot.MyTodoList.util;

public enum BotLabels {

    SHOW_MAIN_SCREEN("Show Main Screen"),
    HIDE_MAIN_SCREEN("Hide Main Screen"),
    LIST_ALL_ITEMS("List All Items"),
    ADD_NEW_ITEM("Add New Item"),
    DONE("DONE"),
    UNDO("UNDO"),
    DELETE("DELETE"),
    MY_TODO_LIST("MY TODO LIST"),
    DASH("-"),
    
    // Nuevas etiquetas para AppUser
    USER_LIST("User List"),
    ADD_NEW_USER("Add New User"),
    FIND_USER("Find User"),
    MY_STATUS("My Status"),
    DELETE_USER("DELETE USER"),
    BACK("Back");

    private String label;

    BotLabels(String enumLabel) {
        this.label = enumLabel;
    }

    public String getLabel() {
        return label;
    }
}