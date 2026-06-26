package com.saas.cours;

import com.saas.cours.config.JwtProperties;
import com.saas.cours.config.StripeProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({JwtProperties.class, StripeProperties.class})
public class SaasCoursApplication {

    public static void main(String[] args) {
        SpringApplication.run(SaasCoursApplication.class, args);
    }
}
