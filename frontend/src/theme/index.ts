import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: "#e6f3ff",
      100: "#b3d9ff",
      200: "#80bfff",
      300: "#4da6ff",
      400: "#1a8cff",
      500: "#0066cc", // Primary brand color
      600: "#0052a3",
      700: "#003d7a",
      800: "#002952",
      900: "#001429",
    },
    gray: {
      50: "#f7fafc",
      100: "#edf2f7",
      200: "#e2e8f0",
      300: "#cbd5e0",
      400: "#a0aec0",
      500: "#718096",
      600: "#4a5568",
      700: "#2d3748",
      800: "#1a202c",
      900: "#171923",
    },
    success: {
      50: "#f0fff4",
      100: "#c6f6d5",
      200: "#9ae6b4",
      300: "#68d391",
      400: "#48bb78",
      500: "#38a169",
      600: "#2f855a",
      700: "#276749",
      800: "#22543d",
      900: "#1c4532",
    },
    warning: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b",
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
    },
    error: {
      50: "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fca5a5",
      400: "#f87171",
      500: "#ef4444",
      600: "#dc2626",
      700: "#b91c1c",
      800: "#991b1b",
      900: "#7f1d1d",
    },
  },
  fonts: {
    heading:
      "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
    body: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
  },
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem",
  },
  space: {
    px: "1px",
    0.5: "0.125rem",
    1: "0.25rem",
    1.5: "0.375rem",
    2: "0.5rem",
    2.5: "0.625rem",
    3: "0.75rem",
    3.5: "0.875rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    7: "1.75rem",
    8: "2rem",
    9: "2.25rem",
    10: "2.5rem",
    12: "3rem",
    14: "3.5rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
    28: "7rem",
    32: "8rem",
    36: "9rem",
    40: "10rem",
    44: "11rem",
    48: "12rem",
    52: "13rem",
    56: "14rem",
    60: "15rem",
    64: "16rem",
    72: "18rem",
    80: "20rem",
    96: "24rem",
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "500",
        borderRadius: "lg",
        _focus: {
          boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)",
        },
      },
      variants: {
        solid: {
          bg: "brand.500",
          color: "white",
          _hover: {
            bg: "brand.600",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(0, 102, 204, 0.4)",
          },
          _active: {
            bg: "brand.700",
            transform: "translateY(0)",
          },
        },
        outline: {
          borderColor: "brand.500",
          color: "brand.500",
          _hover: {
            bg: "brand.50",
            borderColor: "brand.600",
            color: "brand.600",
          },
        },
        ghost: {
          color: "gray.600",
          _hover: {
            bg: "gray.100",
            color: "gray.800",
          },
        },
      },
      sizes: {
        sm: {
          fontSize: "sm",
          px: 3,
          py: 2,
          h: 8,
        },
        md: {
          fontSize: "md",
          px: 4,
          py: 3,
          h: 10,
        },
        lg: {
          fontSize: "lg",
          px: 6,
          py: 4,
          h: 12,
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: "gray.800",
          borderRadius: "xl",
          border: "1px solid",
          borderColor: "gray.700",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          _hover: {
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            transform: "translateY(-2px)",
            transition: "all 0.2s ease-in-out",
          },
        },
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: "full",
        fontWeight: "500",
        px: 3,
        py: 1,
      },
      variants: {
        solid: {
          bg: "brand.500",
          color: "white",
        },
        success: {
          bg: "success.500",
          color: "white",
        },
        warning: {
          bg: "warning.500",
          color: "white",
        },
        error: {
          bg: "error.500",
          color: "white",
        },
        outline: {
          borderColor: "brand.500",
          color: "brand.500",
          bg: "transparent",
        },
      },
    },
    Table: {
      variants: {
        simple: {
          th: {
            borderColor: "gray.700",
            color: "gray.300",
            fontSize: "sm",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "wider",
            py: 4,
          },
          td: {
            borderColor: "gray.700",
            py: 4,
          },
          tbody: {
            tr: {
              _hover: {
                bg: "gray.750",
              },
            },
          },
        },
      },
    },
    Input: {
      variants: {
        filled: {
          field: {
            bg: "gray.700",
            border: "1px solid",
            borderColor: "gray.600",
            _hover: {
              bg: "gray.650",
              borderColor: "gray.500",
            },
            _focus: {
              bg: "gray.650",
              borderColor: "brand.500",
              boxShadow: "0 0 0 1px rgba(0, 102, 204, 0.6)",
            },
          },
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: "gray.900",
        color: "gray.100",
        fontFamily: "body",
        lineHeight: "base",
      },
      "*": {
        borderColor: "gray.700",
      },
    },
  },
});

export default theme;
