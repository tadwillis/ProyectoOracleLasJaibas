package com.springboot.MyTodoList.service;

import java.util.Optional;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.springboot.MyTodoList.model.UserStory;
import com.springboot.MyTodoList.repository.UserStoryRepository;

@Service
@Transactional
public class UserStoryService {

    @Autowired
    private UserStoryRepository userStoryRepository;

    // GET /userstories (paginado)
    public Page<UserStory> findAll(Pageable pageable) {
        return userStoryRepository.findAll(pageable);
    }

    // GET /userstories/{id}
    public ResponseEntity<UserStory> getUserStoryById(int id) {
        Optional<UserStory> us = userStoryRepository.findById(id);
        return us.map(ResponseEntity::ok)
                 .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // POST /userstories
    public UserStory addUserStory(UserStory newUserStory) {
        // Aquí podrías validar status/priority/FKs y lanzar IllegalArgumentException para que el handler devuelva 400
        return userStoryRepository.save(newUserStory);
    }

    // PUT /userstories/{id}
    public UserStory updateUserStory(int id, UserStory incoming) {
        Optional<UserStory> db = userStoryRepository.findById(id);
        if (db.isEmpty()) return null;

        UserStory existing = db.get();
        existing.setTeamId(incoming.getTeamId());
        existing.setTitle(incoming.getTitle());
        existing.setDescription(incoming.getDescription());
        existing.setStoryPoints(incoming.getStoryPoints());
        existing.setPriority(incoming.getPriority());
        existing.setStatus(incoming.getStatus());
        existing.setCreatedBy(incoming.getCreatedBy());
        existing.setUpdatedAt(incoming.getUpdatedAt()); // o manejar @UpdateTimestamp
        return userStoryRepository.save(existing);
    }

    // DELETE /userstories/{id}
    public boolean deleteUserStory(int id) {
        if (!userStoryRepository.existsById(id)) return false;
        userStoryRepository.deleteById(id);
        return true;
    }
}
