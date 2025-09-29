package com.springboot.MyTodoList;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.springboot.MyTodoList.config.BotProps;


@SpringBootApplication
@EnableConfigurationProperties(BotProps.class)
public class MyTodoListApplication {

	public static void main(String[] args) {
		SpringApplication.run(MyTodoListApplication.class, args);
	}

}
