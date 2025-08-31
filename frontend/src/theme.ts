import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  fonts: {
    heading: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    body: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
  colors: {
    brand: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9",
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
    },
    gray: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
      950: "#020617",
    },
    success: {
      50: "#f0fdf4",
      100: "#dcfce7",
      200: "#bbf7d0",
      300: "#86efac",
      400: "#4ade80",
      500: "#22c55e",
      600: "#16a34a",
      700: "#15803d",
      800: "#166534",
      900: "#14532d",
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
  semanticTokens: {
    colors: {
      bg: { _dark: "gray.950", _light: "gray.50" },
      surface: { _dark: "gray.900", _light: "white" },
      surfaceAlt: { _dark: "gray.800", _light: "gray.100" },
      surfaceHover: { _dark: "gray.850", _light: "gray.50" },
      text: { _dark: "gray.50", _light: "gray.900" },
      textMuted: { _dark: "gray.400", _light: "gray.600" },
      textSecondary: { _dark: "gray.300", _light: "gray.700" },
      border: { _dark: "gray.800", _light: "gray.200" },
      borderHover: { _dark: "gray.700", _light: "gray.300" },
      focus: { _dark: "brand.400", _light: "brand.500" },
      accent: { _dark: "brand.400", _light: "brand.500" },
      // Additional semantic colors for better contrast
      textInverse: { _dark: "gray.900", _light: "white" },
      textAccent: { _dark: "brand.300", _light: "brand.600" },
      textSuccess: { _dark: "success.300", _light: "success.600" },
      textWarning: { _dark: "warning.300", _light: "warning.600" },
      textError: { _dark: "error.300", _light: "error.600" },
    },
  },
  space: {
    0.5: "0.125rem",
    1: "0.25rem",
    1.5: "0.375rem",
    2: "0.5rem",
    2.5: "0.625rem",
    3: "0.75rem",
    3.5: "0.875rem",
    4: "1rem",
    4.5: "1.125rem",
    5: "1.25rem",
    5.5: "1.375rem",
    6: "1.5rem",
    7: "1.75rem",
    8: "2rem",
    9: "2.25rem",
    10: "2.5rem",
    11: "2.75rem",
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
  radii: {
    none: "0",
    sm: "0.125rem",
    base: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
    full: "9999px",
  },
  shadows: {
    xs: "0 0 0 1px rgba(0, 0, 0, 0.05)",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    outline: "0 0 0 3px rgba(66, 153, 225, 0.6)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
    none: "none",
  },
  styles: {
    global: {
      "html, body, #root": {
        height: "100%",
        scrollBehavior: "smooth",
      },
      body: {
        bg: "gray.950",
        color: "gray.50",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
        backgroundAttachment: "fixed",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        fontFeatureSettings: "'cv02', 'cv03', 'cv04', 'cv11'",
      },
      "*": {
        borderColor: "gray.800",
      },
      "::selection": {
        bg: "brand.400",
        color: "white",
      },
      "::-webkit-scrollbar": {
        width: "8px",
        height: "8px",
      },
      "::-webkit-scrollbar-track": {
        bg: "gray.900",
      },
      "::-webkit-scrollbar-thumb": {
        bg: "gray.700",
        borderRadius: "4px",
      },
      "::-webkit-scrollbar-thumb:hover": {
        bg: "gray.600",
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: "brand",
        size: "md",
      },
      baseStyle: {
        borderRadius: "lg",
        fontWeight: "medium",
        transition: "all 0.2s",
        _focus: {
          boxShadow: "outline",
        },
      },
      sizes: {
        sm: {
          px: 3,
          py: 2,
          fontSize: "sm",
        },
        md: {
          px: 4,
          py: 2.5,
          fontSize: "sm",
        },
        lg: {
          px: 6,
          py: 3,
          fontSize: "md",
        },
      },
      variants: {
        solid: {
          bg: "brand.500",
          color: "white",
          _hover: {
            bg: "brand.600",
            transform: "translateY(-1px)",
            boxShadow: "lg",
          },
          _active: { bg: "brand.700" },
        },
        outline: {
          border: "1px solid",
          borderColor: "gray.700",
          color: "gray.200",
          _hover: {
            bg: "gray.800",
            borderColor: "gray.600",
            transform: "translateY(-1px)",
          },
        },
        ghost: {
          color: "gray.300",
          _hover: {
            bg: "gray.800",
            color: "gray.100",
          },
          _active: { bg: "gray.700" },
        },
        subtle: {
          bg: "gray.800",
          color: "gray.200",
          _hover: {
            bg: "gray.700",
            transform: "translateY(-1px)",
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: "gray.900",
          border: "1px solid",
          borderColor: "gray.800",
          borderRadius: "xl",
          boxShadow: "sm",
          transition: "all 0.2s",
          _hover: {
            borderColor: "gray.700",
            boxShadow: "md",
            transform: "translateY(-2px)",
          },
        },
      },
    },
    Input: {
      defaultProps: {
        variant: "filled",
        size: "md",
      },
      variants: {
        filled: {
          field: {
            bg: "gray.800",
            border: "1px solid",
            borderColor: "gray.700",
            color: "gray.100",
            borderRadius: "lg",
            _placeholder: { color: "gray.500" },
            _hover: {
              bg: "gray.750",
              borderColor: "gray.600",
            },
            _focus: {
              bg: "gray.800",
              borderColor: "brand.400",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-400)",
            },
          },
        },
        outline: {
          field: {
            bg: "transparent",
            border: "1px solid",
            borderColor: "gray.700",
            color: "gray.100",
            borderRadius: "lg",
            _placeholder: { color: "gray.500" },
            _hover: { borderColor: "gray.600" },
            _focus: {
              borderColor: "brand.400",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-400)",
            },
          },
        },
      },
    },
    Select: {
      defaultProps: {
        variant: "filled",
        size: "md",
      },
      variants: {
        filled: {
          field: {
            bg: "gray.800",
            border: "1px solid",
            borderColor: "gray.700",
            color: "gray.100",
            borderRadius: "lg",
            _hover: {
              bg: "gray.750",
              borderColor: "gray.600",
            },
            _focus: {
              borderColor: "brand.400",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-400)",
            },
          },
        },
      },
    },
    Menu: {
      baseStyle: {
        list: {
          bg: "gray.900",
          border: "1px solid",
          borderColor: "gray.800",
          borderRadius: "xl",
          boxShadow: "xl",
          py: 2,
        },
        item: {
          color: "gray.200",
          borderRadius: "md",
          mx: 2,
          _hover: {
            bg: "gray.800",
            color: "gray.100",
          },
          _focus: {
            bg: "gray.800",
            color: "gray.100",
          },
        },
        divider: {
          borderColor: "gray.700",
          opacity: 1,
        },
      },
      variants: {
        default: {
          list: {
            bg: "gray.900",
            border: "1px solid",
            borderColor: "gray.800",
          },
        },
      },
      defaultProps: {
        variant: "default",
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          bg: "gray.900",
          border: "1px solid",
          borderColor: "gray.800",
          borderRadius: "2xl",
          boxShadow: "2xl",
        },
        header: {
          color: "gray.50",
          fontSize: "lg",
          fontWeight: "semibold",
        },
        body: {
          color: "gray.200",
        },
        footer: {
          borderTop: "1px solid",
          borderColor: "gray.800",
        },
      },
    },
    Popover: {
      baseStyle: {
        content: {
          bg: "gray.900",
          border: "1px solid",
          borderColor: "gray.800",
          borderRadius: "xl",
          boxShadow: "xl",
        },
        header: {
          color: "gray.50",
          bg: "gray.900",
        },
        body: {
          color: "gray.200",
          bg: "gray.900",
        },
      },
    },
    Tooltip: {
      baseStyle: {
        bg: "gray.900",
        color: "gray.100",
        border: "1px solid",
        borderColor: "gray.800",
        borderRadius: "lg",
        boxShadow: "lg",
        fontSize: "sm",
      },
    },
    Table: {
      variants: {
        simple: {
          table: {
            borderCollapse: "separate",
            borderSpacing: 0,
          },
          th: {
            bg: "gray.800",
            color: "gray.100",
            fontWeight: "semibold",
            fontSize: "sm",
            textTransform: "none",
            letterSpacing: "normal",
            borderBottom: "1px solid",
            borderColor: "gray.700",
            py: 3,
            px: 4,
            // Ensure good contrast
            _dark: {
              bg: "gray.800",
              color: "gray.100",
            },
            _light: {
              bg: "gray.100",
              color: "gray.800",
            },
          },
          td: {
            borderBottom: "1px solid",
            borderColor: "gray.800",
            color: "gray.200",
            py: 3,
            px: 4,
            // Ensure good contrast
            _dark: {
              color: "gray.200",
            },
            _light: {
              color: "gray.700",
            },
          },
          tr: {
            _hover: {
              bg: "gray.850",
            },
            _last: {
              td: {
                borderBottom: "none",
              },
            },
          },
        },
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: "full",
        px: 2.5,
        py: 1,
        fontWeight: "medium",
        fontSize: "xs",
        textTransform: "none",
        letterSpacing: "normal",
      },
      variants: {
        solid: {
          bg: "gray.600",
          color: "gray.100",
        },
        subtle: {
          bg: "gray.800",
          color: "gray.200",
        },
        outline: {
          border: "1px solid",
          borderColor: "gray.600",
          color: "gray.200",
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
        info: {
          bg: "brand.500",
          color: "white",
        },
      },
      defaultProps: {
        variant: "subtle",
      },
    },
    Text: {
      baseStyle: {
        color: "gray.100",
      },
    },
    Stat: {
      baseStyle: {
        label: {
          color: "gray.400",
          fontWeight: "medium",
          fontSize: "sm",
          textTransform: "none",
          letterSpacing: "normal",
        },
        number: {
          color: "gray.50",
          fontWeight: "bold",
          fontSize: "2xl",
        },
        helpText: {
          color: "gray.500",
          fontSize: "xs",
        },
      },
    },
    Divider: {
      baseStyle: {
        borderColor: "gray.800",
        opacity: 1,
      },
    },
    Tabs: {
      baseStyle: {
        tab: {
          color: "gray.400",
          _selected: {
            color: "brand.400",
            borderColor: "brand.400",
          },
          _hover: {
            color: "gray.300",
          },
        },
        tablist: {
          borderColor: "gray.800",
        },
        tabpanel: {
          px: 0,
        },
      },
    },
  },
});

export default theme;
