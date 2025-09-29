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
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.springboot.MyTodoList.model.Project;
import com.springboot.MyTodoList.service.ProjectService;

@RestController
@RequestMapping("/projects")
@Validated
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    // GET /projects?page=0&size=10&sort=createdAt,desc
    @GetMapping
    public Page<Project> list(Pageable pageable) {
        return projectService.findAll(pageable);
    }

    // GET /projects/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Project> getById(@PathVariable @Min(1) int id) {
        return projectService.getProjectById(id);
    }

    // POST /projects
    @PostMapping
    public ResponseEntity<Project> create(@Valid @RequestBody Project newProject) {
        Project saved = projectService.addProject(newProject);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(saved.getId())
                .toUri();
        return ResponseEntity.created(location).body(saved); // 201 + Location + body
    }

    // PUT /projects/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Project> update(@PathVariable @Min(1) int id,
                                          @Valid @RequestBody Project incoming) {
        Project updated = projectService.updateProject(id, incoming);
        return (updated == null) ? ResponseEntity.notFound().build()
                                 : ResponseEntity.ok(updated);
    }

    // DELETE /projects/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable @Min(1) int id) {
        boolean deleted = projectService.deleteProject(id);
        return deleted ? ResponseEntity.noContent().build()  // 204
                       : ResponseEntity.notFound().build();  // 404
    }
}
