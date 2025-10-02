package com.tuapp.projectmanagement.controller;

import com.tuapp.projectmanagement.model.*;
import com.tuapp.projectmanagement.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stories")
@RequiredArgsConstructor
public class UserStoryController {
    
    private final UserStoryService storyService;
    
    @PostMapping
    public ResponseEntity<UserStory> createStory(
            @RequestBody UserStory story,
            @RequestParam Long teamId,
            @RequestParam Long createdBy) {
        UserStory created = storyService.createStory(story, teamId, createdBy);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<UserStory> getStoryById(@PathVariable Long id) {
        return storyService.getStoryById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping
    public ResponseEntity<List<UserStory>> getAllStories() {
        return ResponseEntity.ok(storyService.getAllStories());
    }
    
    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<UserStory>> getStoriesByTeam(@PathVariable Long teamId) {
        return ResponseEntity.ok(storyService.getStoriesByTeam(teamId));
    }
    
    @GetMapping("/team/{teamId}/status/{status}")
    public ResponseEntity<List<UserStory>> getStoriesByTeamAndStatus(
            @PathVariable Long teamId,
            @PathVariable String status) {
        return ResponseEntity.ok(storyService.getStoriesByTeamAndStatus(teamId, status));
    }
    
    @GetMapping("/team/{teamId}/ordered")
    public ResponseEntity<List<UserStory>> getStoriesByTeamOrderedByPriority(@PathVariable Long teamId) {
        return ResponseEntity.ok(storyService.getStoriesByTeamOrderedByPriority(teamId));
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<UserStory>> searchStories(@RequestParam String keyword) {
        return ResponseEntity.ok(storyService.searchStoriesByTitle(keyword));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<UserStory> updateStory(@PathVariable Long id, @RequestBody UserStory story) {
        try {
            UserStory updated = storyService.updateStory(id, story);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PatchMapping("/{id}/status")
    public ResponseEntity<UserStory> updateStoryStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            UserStory updated = storyService.updateStoryStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStory(@PathVariable Long id) {
        storyService.deleteStory(id);
        return ResponseEntity.noContent().build();
    }
}