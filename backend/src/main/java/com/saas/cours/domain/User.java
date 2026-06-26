package com.saas.cours.domain;

import com.saas.cours.domain.enums.Role;
import com.saas.cours.domain.enums.SubscriptionStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(name = "stripe_customer_id", length = 255)
    private String stripeCustomerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_status", nullable = false, length = 20)
    @Builder.Default
    private SubscriptionStatus subscriptionStatus = SubscriptionStatus.NONE;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "display_name", length = 255)
    private String displayName;

    @Column(name = "avatar_url", length = 512)
    private String avatarUrl;

    @Column(length = 255)
    private String specialty;

    @OneToMany(mappedBy = "instructor")
    @Builder.Default
    private List<Course> courses = new ArrayList<>();

    @OneToMany(mappedBy = "instructor")
    @Builder.Default
    private List<PrivateSession> instructorSessions = new ArrayList<>();

    @OneToMany(mappedBy = "student")
    @Builder.Default
    private List<PrivateSession> studentSessions = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    @Builder.Default
    private List<Order> orders = new ArrayList<>();
}
