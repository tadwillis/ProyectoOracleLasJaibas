package com.springboot.MyTodoList.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class FrontendController {

    @GetMapping(value = {
        "/", 
        "/taskList", 
        "/myTasks", 
        "/login", 
        "/register", 
        "/profile", 
        "/settings",
        "/{path:[a-zA-Z0-9\\-_]+}", 
        "/{path:[a-zA-Z0-9\\-_]+}/{subpath:[a-zA-Z0-9\\-_]+}"
    })
    public String redirectToIndex() {
        return "forward:/index.html";
    }
}
