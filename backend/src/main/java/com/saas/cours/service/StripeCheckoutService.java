package com.saas.cours.service;

import com.saas.cours.config.StripeProperties;
import com.saas.cours.controller.dto.CheckoutResponse;
import com.saas.cours.domain.Order;
import com.saas.cours.domain.PrivateSession;
import com.saas.cours.domain.User;
import com.saas.cours.domain.enums.OrderStatus;
import com.saas.cours.domain.enums.OrderType;
import com.saas.cours.domain.enums.SessionStatus;
import com.saas.cours.domain.enums.SubscriptionStatus;
import com.saas.cours.exception.PaymentProcessingException;
import com.saas.cours.exception.ResourceNotFoundException;
import com.saas.cours.repository.OrderRepository;
import com.saas.cours.repository.PrivateSessionRepository;
import com.saas.cours.repository.UserRepository;
import com.saas.cours.security.CurrentUserService;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.checkout.Session;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StripeCheckoutService {

    private final StripeProperties stripeProperties;
    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final PrivateSessionRepository privateSessionRepository;

    @Transactional
    public CheckoutResponse createSubscriptionCheckout() {
        User user = currentUserService.getCurrentUser();

        if (user.getSubscriptionStatus() == SubscriptionStatus.ACTIVE) {
            throw new PaymentProcessingException("Vous avez déjà un abonnement actif.");
        }

        Order order = orderRepository.save(Order.builder()
                .user(user)
                .orderType(OrderType.SUBSCRIPTION)
                .status(OrderStatus.PENDING)
                .amountCents(0)
                .currency("EUR")
                .description("Abonnement catalogue de cours")
                .build());

        try {
            String customerId = resolveStripeCustomerId(user);
            Session session = Session.create(SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                    .setCustomer(customerId)
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setPrice(stripeProperties.getSubscriptionPriceId())
                            .setQuantity(1L)
                            .build())
                    .setSuccessUrl(withSessionPlaceholder(stripeProperties.getSuccessUrl()))
                    .setCancelUrl(stripeProperties.getCancelUrl())
                    .putAllMetadata(buildMetadata(order, user))
                    .build());

            order.setStripeCheckoutSessionId(session.getId());
            orderRepository.save(order);

            return new CheckoutResponse(session.getUrl(), session.getId(), order.getId());
        } catch (StripeException ex) {
            throw new PaymentProcessingException("Impossible de créer la session Stripe.", ex);
        }
    }

    @Transactional
    public CheckoutResponse createPrivateSessionCheckout(Long privateSessionId) {
        User student = currentUserService.getCurrentUser();
        PrivateSession privateSession = privateSessionRepository
                .findByIdAndStudentIdWithDetails(privateSessionId, student.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Session privée introuvable."));

        if (privateSession.getStatus() != SessionStatus.REQUESTED) {
            throw new PaymentProcessingException("Cette session n'est pas en attente de paiement.");
        }

        if (privateSession.getOrder() != null && privateSession.getOrder().getStatus() == OrderStatus.PAID) {
            throw new PaymentProcessingException("Cette session est déjà payée.");
        }

        long amountCents = stripeProperties.getPrivateSessionPriceCents();
        Order order = privateSession.getOrder();

        if (order == null || order.getStatus() == OrderStatus.CANCELLED) {
            order = Order.builder()
                    .user(student)
                    .orderType(OrderType.PRIVATE_SESSION)
                    .status(OrderStatus.PENDING)
                    .amountCents(amountCents)
                    .currency("EUR")
                    .description("Cours privé avec " + privateSession.getInstructor().getEmail())
                    .build();
            order = orderRepository.save(order);
            privateSession.setOrder(order);
            privateSessionRepository.save(privateSession);
        } else if (order.getStatus() != OrderStatus.PENDING) {
            throw new PaymentProcessingException("Un paiement est déjà en cours pour cette session.");
        }

        try {
            String customerId = resolveStripeCustomerId(student);
            Session session = Session.create(SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setCustomer(customerId)
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                    .setCurrency("eur")
                                    .setUnitAmount(amountCents)
                                    .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                            .setName("Cours privé")
                                            .setDescription(order.getDescription())
                                            .build())
                                    .build())
                            .setQuantity(1L)
                            .build())
                    .setSuccessUrl(withSessionPlaceholder(stripeProperties.getSuccessUrl()))
                    .setCancelUrl(stripeProperties.getCancelUrl())
                    .putAllMetadata(buildMetadata(order, student, privateSession.getId()))
                    .build());

            order.setStripeCheckoutSessionId(session.getId());
            order.setAmountCents(amountCents);
            orderRepository.save(order);

            return new CheckoutResponse(session.getUrl(), session.getId(), order.getId());
        } catch (StripeException ex) {
            throw new PaymentProcessingException("Impossible de créer la session Stripe.", ex);
        }
    }

    private String resolveStripeCustomerId(User user) throws StripeException {
        if (user.getStripeCustomerId() != null) {
            return user.getStripeCustomerId();
        }

        Customer customer = Customer.create(CustomerCreateParams.builder()
                .setEmail(user.getEmail())
                .putMetadata("userId", user.getId().toString())
                .build());

        user.setStripeCustomerId(customer.getId());
        userRepository.save(user);
        return customer.getId();
    }

    private Map<String, String> buildMetadata(Order order, User user) {
        return buildMetadata(order, user, null);
    }

    private Map<String, String> buildMetadata(Order order, User user, Long privateSessionId) {
        Map<String, String> metadata = new HashMap<>();
        metadata.put("orderId", order.getId().toString());
        metadata.put("orderType", order.getOrderType().name());
        metadata.put("userId", user.getId().toString());
        if (privateSessionId != null) {
            metadata.put("privateSessionId", privateSessionId.toString());
        }
        return metadata;
    }

    private String withSessionPlaceholder(String url) {
        return url.contains("?")
                ? url + "&session_id={CHECKOUT_SESSION_ID}"
                : url + "?session_id={CHECKOUT_SESSION_ID}";
    }
}
