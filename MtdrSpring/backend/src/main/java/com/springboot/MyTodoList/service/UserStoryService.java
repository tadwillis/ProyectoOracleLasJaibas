package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.AppUser;
import com.springboot.MyTodoList.model.Team;
import com.springboot.MyTodoList.model.UserStory;
import com.springboot.MyTodoList.repository.AppUserRepository;
import com.springboot.MyTodoList.repository.TeamRepository;
import com.springboot.MyTodoList.repository.UserStoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserStoryService {
    
    private final UserStoryRepository storyRepository;
    private final TeamRepository teamRepository;
    private final AppUserRepository userRepository;
    
    public UserStory createStory(UserStory story, Long teamId, Long createdByUserId) {
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new RuntimeException("Team not found"));
        AppUser creator = userRepository.findById(createdByUserId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        story.setTeam(team);
        story.setCreatedBy(creator);
        
        return storyRepository.save(story);
    }
    
    public Optional<UserStory> getStoryById(Long id) {
        return storyRepository.findById(id);
    }
    
    public List<UserStory> getAllStories() {
        return storyRepository.findAll();
    }
    
    public List<UserStory> getStoriesByTeam(Long teamId) {
        return storyRepository.findByTeamId(teamId);
    }
    
    public List<UserStory> getStoriesByTeamAndStatus(Long teamId, String status) {
        return storyRepository.findByTeamIdAndStatus(teamId, status);
    }
    
    public List<UserStory> getStoriesByTeamOrderedByPriority(Long teamId) {
        return storyRepository.findByTeamIdOrderByPriority(teamId);
    }
    
    public UserStory updateStory(Long id, UserStory storyDetails) {
        UserStory story = storyRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Story not found"));
        
        story.setTitle(storyDetails.getTitle());
        story.setDescription(storyDetails.getDescription());
        story.setStoryPoints(storyDetails.getStoryPoints());
        story.setEstimatedHours(storyDetails.getEstimatedHours());
        story.setPriority(storyDetails.getPriority());
        story.setStatus(storyDetails.getStatus());
        
        return storyRepository.save(story);
    }
    
    public UserStory updateStoryStatus(Long id, String newStatus) {
        UserStory story = storyRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Story not found"));
        
        story.setStatus(newStatus);
        return storyRepository.save(story);
    }
    
    public void deleteStory(Long id) {
        storyRepository.deleteById(id);
    }
    
    public List<UserStory> searchStoriesByTitle(String keyword) {
        return storyRepository.searchByTitle(keyword);
    }
}