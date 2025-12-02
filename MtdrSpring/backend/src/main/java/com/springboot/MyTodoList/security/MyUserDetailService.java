package com.springboot.MyTodoList.security;

import com.springboot.MyTodoList.model.AppUser;
import com.springboot.MyTodoList.repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Optional;

@Component
public class MyUserDetailService implements UserDetailsService {

    @Autowired private AppUserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<AppUser> userRes = userRepository.findByUsername(username);

        if(userRes.isEmpty())
            throw new UsernameNotFoundException("No user found with this username "+username);
        AppUser user = userRes.get();
        return new
                org.springframework.security.core.userdetails.User(
                        username,
                        user.getPassword(),
                        Collections.singletonList(
                                new SimpleGrantedAuthority("ROLE_" + user.getRole())
                        )
        );
    }
}