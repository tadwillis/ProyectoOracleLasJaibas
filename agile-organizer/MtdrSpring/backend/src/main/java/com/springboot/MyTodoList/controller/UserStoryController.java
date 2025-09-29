package com.springboot.MyTodoList.controller;

import java.net.URI;

import javax.validation.Valid;
import javax.validation.constraints.Min;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.springboot.MyTodoList.model.UserStory;
import com.springboot.MyTodoList.service.UserStoryService;

@RestController
@RequestMapping("/userstories")
@Validated
public class UserStoryController {

    @Autowired
    private UserStoryService userStoryService;

    // GET /userstories?page=0&size=10&sort=createdAt,desc
    @GetMapping
    public Page<UserStory> list(Pageable pageable) {
        return userStoryService.findAll(pageable);
    }

    // GET /userstories/{id}
    @GetMapping("/{id}")
    public ResponseEntity<UserStory> getById(@PathVariable @Min(1) int id) {
        return userStoryService.getUserStoryById(id);
    }

    // POST /userstories
    @PostMapping
    public ResponseEntity<UserStory> create(@Valid @RequestBody UserStory newUserStory) {
        UserStory saved = userStoryService.addUserStory(newUserStory);
        URI location = URI.create("/userstories/" + saved.getId());
        return ResponseEntity.created(location).body(saved); // 201 + Location + body
    }

    // PUT /userstories/{id}
    @PutMapping("/{id}")
    public ResponseEntity<UserStory> update(@PathVariable @Min(1) int id,
                                            @Valid @RequestBody UserStory incoming) {
        UserStory updated = userStoryService.updateUserStory(id, incoming);
        return (updated == null) ? ResponseEntity.notFound().build()
                                 : ResponseEntity.ok(updated);
    }

    // DELETE /userstories/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable @Min(1) int id) {
        boolean deleted = userStoryService.deleteUserStory(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
