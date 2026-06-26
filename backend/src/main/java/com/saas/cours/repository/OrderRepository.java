package com.saas.cours.repository;

import com.saas.cours.domain.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o JOIN FETCH o.user WHERE o.id = :id")
    Optional<Order> findByIdWithUser(@Param("id") Long id);

    @Query("SELECT o FROM Order o JOIN FETCH o.user WHERE o.stripeCheckoutSessionId = :sessionId")
    Optional<Order> findByStripeCheckoutSessionIdWithUser(@Param("sessionId") String sessionId);
}
