package com.ramesh.backend.controller;

import com.ramesh.backend.dto.response.DashboardResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
//@CrossOrigin(origins="${cors.allowed-origins}", allowCredentials = "true")
@PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
public class DashboardController {

    //mock data
    @GetMapping
    public ResponseEntity<?> getDashboardData(){
        DashboardResponse data = new DashboardResponse(150, 23, 47);
        return ResponseEntity.ok(data);
    }
}
