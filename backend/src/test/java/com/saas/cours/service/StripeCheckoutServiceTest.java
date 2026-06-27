package com.saas.cours.service;

import com.saas.cours.config.StripeProperties;
import com.saas.cours.controller.dto.CheckoutResponse;
import com.saas.cours.domain.Order;
import com.saas.cours.domain.PrivateSession;
import com.saas.cours.domain.User;
import com.saas.cours.domain.enums.OrderStatus;
import com.saas.cours.domain.enums.OrderType;
import com.saas.cours.domain.enums.SessionStatus;
import com.saas.cours.repository.OrderRepository;
import com.saas.cours.repository.PrivateSessionRepository;
import com.saas.cours.repository.UserRepository;
import com.saas.cours.security.CurrentUserService;
import com.saas.cours.support.TestUsers;
import com.stripe.model.Customer;
import com.stripe.model.checkout.Session;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StripeCheckoutServiceTest {

    @Mock
    private StripeProperties stripeProperties;

    @Mock
    private CurrentUserService currentUserService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private PrivateSessionRepository privateSessionRepository;

    @InjectMocks
    private StripeCheckoutService stripeCheckoutService;

    private User student;
    private User instructor;
    private PrivateSession privateSession;
    private Order cancelledOrder;

    @BeforeEach
    void setUp() {
        student = TestUsers.student("checkout-student@test.com");
        student.setId(1L);
        instructor = TestUsers.instructor("checkout-instructor@test.com");
        instructor.setId(2L);

        cancelledOrder = Order.builder()
                .user(student)
                .orderType(OrderType.PRIVATE_SESSION)
                .status(OrderStatus.CANCELLED)
                .amountCents(5000)
                .currency("EUR")
                .description("Cours privé")
                .build();
        cancelledOrder.setId(10L);

        privateSession = PrivateSession.builder()
                .student(student)
                .instructor(instructor)
                .scheduledAt(Instant.parse("2030-10-01T10:00:00Z"))
                .durationMinutes(60)
                .status(SessionStatus.REQUESTED)
                .order(cancelledOrder)
                .build();
        privateSession.setId(5L);
    }

    @Test
    void createsNewOrderWhenPreviousOrderCancelled() throws Exception {
        when(currentUserService.getCurrentUser()).thenReturn(student);
        when(privateSessionRepository.findByIdAndStudentIdWithDetails(5L, 1L))
                .thenReturn(Optional.of(privateSession));
        when(stripeProperties.getPrivateSessionPriceCents()).thenReturn(5000L);
        when(stripeProperties.getSuccessUrl()).thenReturn("http://localhost/success");
        when(stripeProperties.getCancelUrl()).thenReturn("http://localhost/cancel");
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            if (order.getId() == null) {
                order.setId(11L);
            }
            return order;
        });
        when(userRepository.save(student)).thenReturn(student);

        try (MockedStatic<Customer> customerMock = mockStatic(Customer.class);
                MockedStatic<Session> sessionMock = mockStatic(Session.class)) {
            Customer customer = mock(Customer.class);
            when(customer.getId()).thenReturn("cus_test");
            customerMock.when(() -> Customer.create(any(CustomerCreateParams.class))).thenReturn(customer);

            Session stripeSession = mock(Session.class);
            when(stripeSession.getId()).thenReturn("cs_test");
            when(stripeSession.getUrl()).thenReturn("https://checkout.stripe.test/session");
            sessionMock.when(() -> Session.create(any(SessionCreateParams.class))).thenReturn(stripeSession);

            CheckoutResponse response = stripeCheckoutService.createPrivateSessionCheckout(5L);

            assertThat(response.checkoutUrl()).isEqualTo("https://checkout.stripe.test/session");
            assertThat(response.orderId()).isEqualTo(11L);
        }
    }
}
