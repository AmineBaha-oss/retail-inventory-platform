package com.retailinventory.infrastructure.exception;

/**
 * Exception thrown when validation fails.
 */
public class ValidationException extends RuntimeException {
    
    public ValidationException(String message) {
        super(message);
    }
    
    public ValidationException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public ValidationException(String fieldName, String reason) {
        super(String.format("Validation failed for field '%s': %s", fieldName, reason));
    }
}
