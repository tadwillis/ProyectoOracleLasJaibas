package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.TeamMemberDTO;
import com.springboot.MyTodoList.service.TeamMemberService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Min;
import java.net.URI;

@RestController
@RequestMapping("/api/team-members")
@Validated
public class TeamMemberController {

    private final TeamMemberService service;

    public TeamMemberController(TeamMemberService service) {
        this.service = service;
    }

    
    @GetMapping
    public Page<TeamMemberDTO> all(Pageable pageable) {
        return service.findAll(pageable);
    }

    
    @GetMapping("/{id}")
    public ResponseEntity<TeamMemberDTO> get(@PathVariable @Min(1) Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    
    @PostMapping
    public ResponseEntity<TeamMemberDTO> create(@Valid @RequestBody TeamMemberDTO dto) {
        TeamMemberDTO saved = service.create(dto);
        URI location = URI.create("/api/team-members/" + saved.getTeamMemberId());
        return ResponseEntity.created(location).body(saved);
    }

    
    @PutMapping("/{id}")
    public ResponseEntity<TeamMemberDTO> update(@PathVariable @Min(1) Long id,
                                                @Valid @RequestBody TeamMemberDTO dto) {
        TeamMemberDTO updated = service.update(id, dto);
        return (updated == null)
                ? ResponseEntity.notFound().build()
                : ResponseEntity.ok(updated);
    }

   
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable @Min(1) Long id) {
        boolean deleted = service.delete(id);
        return deleted
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
