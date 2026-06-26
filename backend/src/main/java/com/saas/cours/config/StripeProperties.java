package com.saas.cours.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.stripe")
public class StripeProperties {

    private String apiKey;
    private String webhookSecret;
    private String successUrl;
    private String cancelUrl;
    private String subscriptionPriceId;
    private long privateSessionPriceCents;
}
