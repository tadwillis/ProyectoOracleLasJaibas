package com.springboot.MyTodoList.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class WebSecurityConfiguration {
    
    protected SecurityFilterChain configure(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.csrf().disable();
        //httpSecurity.authorizeRequests().anyRequest().authenticated().and().
        //        formLogin().and().logout().permitAll();

        return httpSecurity.build();
    }
}
