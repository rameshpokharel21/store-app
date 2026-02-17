package com.ramesh.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name="users",
 uniqueConstraints = {
        @UniqueConstraint(columnNames = "email")
 })
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    //Roles are not entity but value based and fixed and determined by Role enum
    @Column(name="roles")
    @Enumerated(EnumType.STRING)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name="user_roles", joinColumns = @JoinColumn(name="user_id"))
    private Set<Role> roles = new HashSet<>();

    /*
    * Role can be added or removed
    * No Enum
    @Entity
    public class Role {
    @Id @GeneratedValue
    private Long id;

    private String name; // e.g. "ADMIN"
    }
    *
    * @ManyToMany(fetch = FetchType.EAGER)
    *
    * Inside User entity
    @JoinTable(
        name="user_roles",
        joinColumns=@JoinColumn(name="user_id"),
        inverseJoinColumns=@JoinColumn(name="role_id")
    )
    private Set<Role> roles;


    Option 3:
    * @Entity
    public class Role {

        @Id @GeneratedValue
        private Long id;

        @Enumerated(EnumType.STRING)
        private RoleEnum name;
    }
    * Inside User
    *
    @ManyToMany
    private Set<Role> roles;


     */

    private boolean enabled = true;

    @Column(name="created_at")
    private LocalDateTime createdAt;

    @Column(name="updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreated(){
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected  void onUpdate(){
        updatedAt = LocalDateTime.now();
    }

}
