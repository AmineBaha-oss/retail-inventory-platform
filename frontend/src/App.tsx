import React from "react";
import { Routes, Route } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Stores from "./pages/Stores";
import Forecasting from "./pages/Forecasting";
import Inventory from "./pages/Inventory";
import PurchaseOrders from "./pages/PurchaseOrders";
import Suppliers from "./pages/Suppliers";
import Products from "./pages/Products";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import ErrorBoundary from "./components/ErrorBoundary";
import { useAuthStore } from "./stores/authStore";

function App() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <>
        <Login />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1A202C",
              color: "#FFFFFF",
              border: "1px solid #2D3748",
            },
            success: {
              iconTheme: {
                primary: "#48BB78",
                secondary: "#FFFFFF",
              },
            },
            error: {
              iconTheme: {
                primary: "#F56565",
                secondary: "#FFFFFF",
              },
            },
          }}
        />
      </>
    );
  }

  return (
    <ErrorBoundary>
      <Box minH="100vh" bg="gray.900">
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/stores" element={<Stores />} />
            <Route path="/forecasting" element={<Forecasting />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/products" element={<Products />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1A202C",
              color: "#FFFFFF",
              border: "1px solid #2D3748",
            },
            success: {
              iconTheme: {
                primary: "#48BB78",
                secondary: "#FFFFFF",
              },
            },
            error: {
              iconTheme: {
                primary: "#F56565",
                secondary: "#FFFFFF",
              },
            },
          }}
        />
      </Box>
    </ErrorBoundary>
  );
}

export default App;
