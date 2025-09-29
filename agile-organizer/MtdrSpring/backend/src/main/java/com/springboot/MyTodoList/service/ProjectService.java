package com.springboot.MyTodoList.service;

import java.util.Optional;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.springboot.MyTodoList.model.Project;
import com.springboot.MyTodoList.repository.ProjectRepository;

@Service
@Transactional
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    // GET /projects (paginado)
    public Page<Project> findAll(Pageable pageable) {
        return projectRepository.findAll(pageable);
    }

    // GET /projects/{id}
    public ResponseEntity<Project> getProjectById(int id) {
        Optional<Project> p = projectRepository.findById(id);
        return p.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // POST /projects
    public Project addProject(Project project) {
        // Aquí puedes validar FKs (teamId/createdBy) y lanzar IllegalArgumentException para que el handler devuelva 400
        return projectRepository.save(project);
    }

    // PUT /projects/{id}
    public Project updateProject(int id, Project incoming) {
        Optional<Project> db = projectRepository.findById(id);
        if (db.isEmpty()) return null;

        Project existing = db.get();
        // Actualiza solo los campos editables
        existing.setTeamId(incoming.getTeamId());
        existing.setName(incoming.getName());
        existing.setDescription(incoming.getDescription());
        existing.setCreatedBy(incoming.getCreatedBy());
        // createdAt se mantiene (lo maneja BD/JPA)
        return projectRepository.save(existing);
    }

    // DELETE /projects/{id}
    public boolean deleteProject(int id) {
        if (!projectRepository.existsById(id)) return false;
        projectRepository.deleteById(id);
        return true;
    }
}
