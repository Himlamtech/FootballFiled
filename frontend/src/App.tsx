import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
import UserLayout from "@/layouts/UserLayout";
import AdminLayout from "@/layouts/AdminLayout";

// User Pages
import Home from "@/pages/user/Home";
import BookingField from "@/pages/user/BookingField";
import FindOpponents from "@/pages/user/FindOpponents";
import Services from "@/pages/user/Services";

// Admin Pages
import Dashboard from "@/pages/admin/Dashboard";
import FieldManagement from "@/pages/admin/FieldManagement";
import ProductManagement from "@/pages/admin/ProductManagement";
import Feedback from "@/pages/admin/Feedback";

// Other Pages
import NotFound from "@/pages/NotFound";
import ApiTest from "@/pages/ApiTest";

// Auth Provider
import { AuthProvider } from "@/hooks/useAuth";

// Create queryClient outside of component to avoid recreation on re-render
const queryClient = new QueryClient();

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <Sonner />
          <Routes>
            {/* User Routes */}
            <Route element={<UserLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/booking" element={<BookingField />} />
              <Route path="/opponents" element={<FindOpponents />} />
              <Route path="/services" element={<Services />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="fields" element={<FieldManagement />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="feedback" element={<Feedback />} />
            </Route>

            {/* Test Route */}
            <Route path="/api-test" element={<ApiTest />} />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
