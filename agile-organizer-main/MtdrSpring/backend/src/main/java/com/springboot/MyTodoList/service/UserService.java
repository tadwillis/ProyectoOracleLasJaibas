package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.User;
import com.springboot.MyTodoList.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> findAll(){
        List<User> users = userRepository.findAll();
        return users;
    }

    public ResponseEntity<User> getUserById(int id){
        Optional<User> userById = userRepository.findById(id);
        if (userById.isPresent()){
            return new ResponseEntity<>(userById.get(), HttpStatus.OK);
        }else{
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }


    public User addUser(User newUser){
        return userRepository.save(newUser);
    }

    public boolean deleteUser(int id){
        try{
            userRepository.deleteById(id);
            return true;
        }catch(Exception e){
            return false;
        }
    }
    public User updateUser(int id, User user2update){
        Optional<User> dbUser = userRepository.findById(id);
        if(dbUser.isPresent()){
            User user = dbUser.get();
            user.setID(id);
            user.setPhoneNumber(user2update.getPhoneNumber());
            user.setUserPassword(user2update.getUserPassword());
            return userRepository.save(user);
        }else{
            return null;
        }
    }

}
