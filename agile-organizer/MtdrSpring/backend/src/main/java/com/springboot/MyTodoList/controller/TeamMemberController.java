package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.TeamMemberDTO;
import com.springboot.MyTodoList.service.TeamMemberService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/team-members")
public class TeamMemberController {

    private final TeamMemberService service;

    public TeamMemberController(TeamMemberService service) {
        this.service = service;
    }

    @GetMapping
    public List<TeamMemberDTO> all() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeamMemberDTO> get(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public TeamMemberDTO create(@RequestBody TeamMemberDTO dto) {
        return service.create(dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
