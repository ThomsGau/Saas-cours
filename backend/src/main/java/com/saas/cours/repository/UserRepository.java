package com.saas.cours.repository;

import com.saas.cours.domain.User;
import com.saas.cours.domain.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(Role role);

    List<User> findByDisplayNameIsNull();

    Optional<User> findByStripeCustomerId(String stripeCustomerId);
}
