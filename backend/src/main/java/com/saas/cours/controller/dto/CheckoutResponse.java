package com.saas.cours.controller.dto;

public record CheckoutResponse(
        String checkoutUrl,
        String stripeSessionId,
        Long orderId
) {
}
