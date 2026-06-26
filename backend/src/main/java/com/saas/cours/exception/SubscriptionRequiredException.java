package com.saas.cours.exception;

public class SubscriptionRequiredException extends RuntimeException {

    public SubscriptionRequiredException() {
        super("Un abonnement actif est requis pour accéder au catalogue.");
    }
}
