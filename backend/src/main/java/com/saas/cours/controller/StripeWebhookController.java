package com.saas.cours.controller;

import com.saas.cours.config.StripeProperties;
import com.saas.cours.service.StripeWebhookService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/webhooks/stripe")
@RequiredArgsConstructor
public class StripeWebhookController {

    private final StripeProperties stripeProperties;
    private final StripeWebhookService stripeWebhookService;

    @PostMapping
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signature
    ) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, signature, stripeProperties.getWebhookSecret());
        } catch (SignatureVerificationException ex) {
            log.warn("Signature Stripe invalide : {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Signature invalide");
        }

        try {
            stripeWebhookService.handleEvent(event);
        } catch (Exception ex) {
            log.error("Erreur lors du traitement de l'événement Stripe {}", event.getId(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur de traitement");
        }

        return ResponseEntity.ok("ok");
    }
}
