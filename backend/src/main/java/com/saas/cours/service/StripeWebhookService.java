package com.saas.cours.service;

import com.saas.cours.domain.Order;
import com.saas.cours.domain.PrivateSession;
import com.saas.cours.domain.User;
import com.saas.cours.domain.enums.OrderStatus;
import com.saas.cours.domain.enums.OrderType;
import com.saas.cours.domain.enums.SessionStatus;
import com.saas.cours.domain.enums.SubscriptionStatus;
import com.saas.cours.repository.OrderRepository;
import com.saas.cours.repository.PrivateSessionRepository;
import com.saas.cours.repository.UserRepository;
import com.stripe.model.Event;
import com.stripe.model.Invoice;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class StripeWebhookService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final PrivateSessionRepository privateSessionRepository;
    private final SlotLifecycleService slotLifecycleService;

    @Transactional
    public void handleEvent(Event event) {
        switch (event.getType()) {
            case "checkout.session.completed" -> handleCheckoutSessionCompleted(event);
            case "checkout.session.expired" -> handleCheckoutSessionExpired(event);
            case "customer.subscription.updated" -> handleSubscriptionUpdated(event);
            case "customer.subscription.deleted" -> handleSubscriptionDeleted(event);
            case "invoice.payment_failed" -> handleInvoicePaymentFailed(event);
            default -> log.debug("Événement Stripe ignoré : {}", event.getType());
        }
    }

    private void handleCheckoutSessionCompleted(Event event) {
        Session session = (Session) event.getDataObjectDeserializer()
                .getObject()
                .orElseThrow(() -> new IllegalStateException("Session Stripe introuvable dans l'événement."));

        if (!"paid".equals(session.getPaymentStatus())) {
            log.info("Checkout session {} non payée, statut : {}", session.getId(), session.getPaymentStatus());
            return;
        }

        Order order = findOrder(session);
        if (order.getStatus() == OrderStatus.PAID) {
            return;
        }

        order.setStatus(OrderStatus.PAID);
        order.setStripeCheckoutSessionId(session.getId());
        if (session.getPaymentIntent() != null) {
            order.setStripePaymentIntentId(session.getPaymentIntent());
        }
        orderRepository.save(order);

        User user = order.getUser();
        if (user.getStripeCustomerId() == null && session.getCustomer() != null) {
            user.setStripeCustomerId(session.getCustomer());
        }

        if (order.getOrderType() == OrderType.SUBSCRIPTION) {
            user.setSubscriptionStatus(SubscriptionStatus.ACTIVE);
            userRepository.save(user);
            return;
        }

        if (order.getOrderType() == OrderType.PRIVATE_SESSION) {
            confirmPrivateSession(order, session);
        }
    }

    private void handleCheckoutSessionExpired(Event event) {
        Session session = (Session) event.getDataObjectDeserializer()
                .getObject()
                .orElseThrow(() -> new IllegalStateException("Session Stripe introuvable dans l'événement."));

        findOrderOptional(session).ifPresent(order -> {
            if (order.getStatus() == OrderStatus.PENDING) {
                order.setStatus(OrderStatus.CANCELLED);
                orderRepository.save(order);

                if (order.getOrderType() == OrderType.PRIVATE_SESSION) {
                    privateSessionRepository.findByOrderId(order.getId())
                            .filter(privateSession -> privateSession.getStatus() == SessionStatus.REQUESTED)
                            .ifPresent(slotLifecycleService::cancelUnpaidSession);
                }
            }
        });
    }

    private void handleSubscriptionUpdated(Event event) {
        Subscription subscription = (Subscription) event.getDataObjectDeserializer()
                .getObject()
                .orElseThrow(() -> new IllegalStateException("Abonnement Stripe introuvable dans l'événement."));

        userRepository.findByStripeCustomerId(subscription.getCustomer())
                .ifPresent(user -> {
                    user.setSubscriptionStatus(mapSubscriptionStatus(subscription.getStatus()));
                    userRepository.save(user);
                });
    }

    private void handleSubscriptionDeleted(Event event) {
        Subscription subscription = (Subscription) event.getDataObjectDeserializer()
                .getObject()
                .orElseThrow(() -> new IllegalStateException("Abonnement Stripe introuvable dans l'événement."));

        userRepository.findByStripeCustomerId(subscription.getCustomer())
                .ifPresent(user -> {
                    user.setSubscriptionStatus(SubscriptionStatus.CANCELLED);
                    userRepository.save(user);
                });
    }

    private void handleInvoicePaymentFailed(Event event) {
        Invoice invoice = (Invoice) event.getDataObjectDeserializer()
                .getObject()
                .orElseThrow(() -> new IllegalStateException("Facture Stripe introuvable dans l'événement."));

        if (invoice.getCustomer() == null) {
            return;
        }

        userRepository.findByStripeCustomerId(invoice.getCustomer())
                .ifPresent(user -> {
                    user.setSubscriptionStatus(SubscriptionStatus.PAST_DUE);
                    userRepository.save(user);
                });
    }

    private void confirmPrivateSession(Order order, Session session) {
        Long privateSessionId = parsePrivateSessionId(session, order);
        if (privateSessionId == null) {
            log.warn("Commande {} sans privateSessionId dans les métadonnées Stripe.", order.getId());
            return;
        }

        privateSessionRepository.findById(privateSessionId).ifPresent(privateSession -> {
            privateSession.setStatus(SessionStatus.CONFIRMED);
            privateSession.setOrder(order);
            privateSessionRepository.save(privateSession);
        });
    }

    private Order findOrder(Session session) {
        return findOrderOptional(session).orElseThrow(() ->
                new IllegalStateException("Commande introuvable pour la session Stripe " + session.getId()));
    }

    private Optional<Order> findOrderOptional(Session session) {
        if (session.getMetadata() != null && session.getMetadata().get("orderId") != null) {
            return orderRepository.findByIdWithUser(Long.parseLong(session.getMetadata().get("orderId")));
        }
        return orderRepository.findByStripeCheckoutSessionIdWithUser(session.getId());
    }

    private Long parsePrivateSessionId(Session session, Order order) {
        if (session.getMetadata() != null && session.getMetadata().get("privateSessionId") != null) {
            return Long.parseLong(session.getMetadata().get("privateSessionId"));
        }
        PrivateSession privateSession = order.getPrivateSession();
        return privateSession != null ? privateSession.getId() : null;
    }

    private SubscriptionStatus mapSubscriptionStatus(String stripeStatus) {
        return switch (stripeStatus) {
            case "active", "trialing" -> SubscriptionStatus.ACTIVE;
            case "past_due", "unpaid" -> SubscriptionStatus.PAST_DUE;
            case "canceled" -> SubscriptionStatus.CANCELLED;
            case "incomplete", "incomplete_expired", "paused" -> SubscriptionStatus.EXPIRED;
            default -> SubscriptionStatus.NONE;
        };
    }
}
