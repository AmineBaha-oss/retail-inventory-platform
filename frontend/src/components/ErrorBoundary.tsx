import React, { Component, ErrorInfo, ReactNode } from "react";
import {
  Box,
  VStack,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  Collapse,
  useDisclosure,
} from "@chakra-ui/react";
import { FiRefreshCw, FiChevronDown, FiChevronUp } from "react-icons/fi";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Log to external service in production
    if (import.meta.env.PROD) {
      // TODO: Send to error tracking service (e.g., Sentry, LogRocket)
      console.error("Production error:", {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <ErrorFallback error={this.state.error} onReset={this.handleReset} />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Box
      minH="400px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={8}
    >
      <VStack spacing={6} maxW="600px" textAlign="center">
        <Alert status="error" borderRadius="lg" p={6}>
          <AlertIcon boxSize="40px" mr={4} />
          <Box>
            <AlertTitle fontSize="lg" mb={2}>
              Oops! Something went wrong
            </AlertTitle>
            <AlertDescription fontSize="sm" color="gray.600">
              We encountered an unexpected error. Please try refreshing the page
              or contact support if the problem persists.
            </AlertDescription>
          </Box>
        </Alert>

        <VStack spacing={4}>
          <Button
            leftIcon={<FiRefreshCw />}
            colorScheme="blue"
            onClick={onReset}
            size="lg"
          >
            Try Again
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            rightIcon={isOpen ? <FiChevronUp /> : <FiChevronDown />}
          >
            {isOpen ? "Hide" : "Show"} Error Details
          </Button>
        </VStack>

        <Collapse in={isOpen} animateOpacity>
          <Box
            p={4}
            bg="gray.50"
            borderRadius="md"
            textAlign="left"
            fontSize="sm"
            maxW="100%"
            overflow="auto"
          >
            <Text fontWeight="bold" mb={2}>
              Error Details:
            </Text>
            {error && (
              <VStack align="start" spacing={2}>
                <Box>
                  <Text fontWeight="semibold">Message:</Text>
                  <Code
                    colorScheme="red"
                    p={2}
                    borderRadius="md"
                    display="block"
                  >
                    {error.message}
                  </Code>
                </Box>
                {error.stack && (
                  <Box>
                    <Text fontWeight="semibold">Stack Trace:</Text>
                    <Code
                      colorScheme="gray"
                      p={2}
                      borderRadius="md"
                      display="block"
                      whiteSpace="pre-wrap"
                      fontSize="xs"
                      maxH="200px"
                      overflow="auto"
                    >
                      {error.stack}
                    </Code>
                  </Box>
                )}
              </VStack>
            )}
          </Box>
        </Collapse>

        <Text fontSize="xs" color="gray.500">
          If this error persists, please contact support with the error details
          above.
        </Text>
      </VStack>
    </Box>
  );
}

// Hook for programmatic error throwing
export function useErrorHandler() {
  return (error: Error) => {
    throw error;
  };
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}

export default ErrorBoundary;
