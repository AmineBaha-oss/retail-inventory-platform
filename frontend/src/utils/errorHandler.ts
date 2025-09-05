import { AxiosError } from "axios";
import { toast } from "react-hot-toast";

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export class ErrorHandler {
  /**
   * Handle API errors and show appropriate user messages
   */
  static handleApiError(
    error: AxiosError | Error,
    customMessage?: string
  ): ApiError {
    let apiError: ApiError = {
      message: customMessage || "An unexpected error occurred",
    };

    if (error instanceof AxiosError) {
      const response = error.response;
      const request = error.request;

      if (response) {
        // Server responded with error status
        apiError = {
          message:
            this.getErrorMessage(response.data) ||
            `Server error: ${response.status}`,
          status: response.status,
          code: response.data?.code || response.data?.error_code,
          details: response.data,
        };

        // Handle specific HTTP status codes
        switch (response.status) {
          case 400:
            apiError.message = response.data?.message || "Invalid request data";
            break;
          case 401:
            apiError.message = "Authentication required. Please log in again.";
            // Auto-logout will be handled by interceptor
            break;
          case 403:
            apiError.message =
              "You don't have permission to perform this action";
            break;
          case 404:
            apiError.message =
              customMessage || "The requested resource was not found";
            break;
          case 409:
            apiError.message =
              response.data?.message ||
              "A conflict occurred. The resource may already exist.";
            break;
          case 422:
            apiError.message =
              this.formatValidationErrors(response.data) || "Validation error";
            break;
          case 429:
            apiError.message = "Too many requests. Please try again later.";
            break;
          case 500:
            apiError.message = "Internal server error. Please try again later.";
            break;
          case 502:
          case 503:
          case 504:
            apiError.message =
              "Service temporarily unavailable. Please try again later.";
            break;
        }
      } else if (request) {
        // Request was made but no response received
        apiError = {
          message: "Network error. Please check your connection and try again.",
          code: "NETWORK_ERROR",
        };
      } else {
        // Error in request setup
        apiError = {
          message: error.message || "Failed to make request",
          code: "REQUEST_ERROR",
        };
      }
    } else {
      // Generic error
      apiError = {
        message: error.message || "An unexpected error occurred",
        code: "GENERIC_ERROR",
      };
    }

    return apiError;
  }

  /**
   * Show error toast notification
   */
  static showErrorToast(
    error: AxiosError | Error,
    customMessage?: string
  ): void {
    const apiError = this.handleApiError(error, customMessage);
    toast.error(apiError.message, {
      duration: 5000,
      position: "top-right",
    });
  }

  /**
   * Show success toast notification
   */
  static showSuccessToast(message: string): void {
    toast.success(message, {
      duration: 3000,
      position: "top-right",
    });
  }

  /**
   * Show info toast notification
   */
  static showInfoToast(message: string): void {
    toast(message, {
      duration: 4000,
      position: "top-right",
      icon: "ℹ️",
    });
  }

  /**
   * Extract error message from various response formats
   */
  private static getErrorMessage(data: any): string | null {
    if (!data) return null;

    // Check common error message fields
    if (typeof data === "string") return data;
    if (data.message) return data.message;
    if (data.detail) return data.detail;
    if (data.error) return data.error;
    if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors[0].message || data.errors[0];
    }

    return null;
  }

  /**
   * Format validation errors into readable message
   */
  private static formatValidationErrors(data: any): string | null {
    if (!data) return null;

    // Spring Boot validation errors
    if (data.errors && Array.isArray(data.errors)) {
      const messages = data.errors.map((err: any) => {
        if (typeof err === "string") return err;
        if (err.field && err.message) return `${err.field}: ${err.message}`;
        if (err.message) return err.message;
        return JSON.stringify(err);
      });
      return messages.join(", ");
    }

    // FastAPI validation errors
    if (data.detail && Array.isArray(data.detail)) {
      const messages = data.detail.map((err: any) => {
        if (err.loc && err.msg) {
          const field = err.loc.join(".");
          return `${field}: ${err.msg}`;
        }
        return err.msg || JSON.stringify(err);
      });
      return messages.join(", ");
    }

    return this.getErrorMessage(data);
  }

  /**
   * Check if error is retryable
   */
  static isRetryableError(error: AxiosError | Error): boolean {
    if (error instanceof AxiosError && error.response) {
      const status = error.response.status;
      // Retry on server errors and rate limits
      return status >= 500 || status === 429;
    }

    // Retry on network errors
    return !error.message || error.message.toLowerCase().includes("network");
  }

  /**
   * Get retry delay for exponential backoff
   */
  static getRetryDelay(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10 seconds
  }
}

// Helper functions for common use cases
export const showError = (error: AxiosError | Error | string, customMessage?: string) => {
  if (typeof error === 'string') {
    ErrorHandler.showErrorToast(new Error(error), customMessage);
  } else {
    ErrorHandler.showErrorToast(error, customMessage);
  }
};

export const showSuccess = (message: string) =>
  ErrorHandler.showSuccessToast(message);

export const showInfo = (message: string) =>
  ErrorHandler.showInfoToast(message);

export const handleApiError = (
  error: AxiosError | Error,
  customMessage?: string
) => ErrorHandler.handleApiError(error, customMessage);
