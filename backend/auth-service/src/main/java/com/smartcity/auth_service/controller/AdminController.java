package com.smartcity.auth_service.controller;

import com.smartcity.auth_service.entity.dto.UserDto;
import com.smartcity.auth_service.entity.Role;
import com.smartcity.auth_service.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
public class AdminController {

    private final AuthService service;

    // GET /admin/users -> Voir tout le monde
    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(service.getAllUsers());
    }

    // DELETE /admin/users/{id} -> Bannir quelqu'un
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        service.deleteUser(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }

    // PATCH /admin/users/{id}/role?role=ADMIN -> Promotion
    @PatchMapping("/{id}/role")
    public ResponseEntity<UserDto> updateUserRole(@PathVariable Long id, @RequestParam Role role) {
        return ResponseEntity.ok(service.updateUserRole(id, role));
    }
}