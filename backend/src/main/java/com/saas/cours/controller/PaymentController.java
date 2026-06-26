package com.saas.cours.controller;

import com.saas.cours.controller.dto.CheckoutResponse;
import com.saas.cours.service.StripeCheckoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final StripeCheckoutService stripeCheckoutService;

    @PostMapping("/subscription/checkout")
    public CheckoutResponse createSubscriptionCheckout() {
        return stripeCheckoutService.createSubscriptionCheckout();
    }

    @PostMapping("/private-sessions/{privateSessionId}/checkout")
    public CheckoutResponse createPrivateSessionCheckout(@PathVariable Long privateSessionId) {
        return stripeCheckoutService.createPrivateSessionCheckout(privateSessionId);
    }
}
