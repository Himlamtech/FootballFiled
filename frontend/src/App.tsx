import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";

// Layouts
import UserLayout from "@/layouts/UserLayout";
import AdminLayout from "@/layouts/AdminLayout";

// User Pages
import Home from "@/pages/user/Home";
import BookingField from "@/pages/user/BookingField";
import FindOpponents from "@/pages/user/FindOpponents";

// Admin Pages
import Dashboard from "@/pages/admin/Dashboard";
import FieldManagement from "@/pages/admin/FieldManagement";
import Feedback from "@/pages/admin/Feedback";

// Other Pages
import NotFound from "@/pages/NotFound";
import ApiTest from "@/pages/ApiTest";

// Auth Provider
import { AuthProvider } from "@/hooks/useAuth";

// Create queryClient outside of component to avoid recreation on re-render
const queryClient = new QueryClient();

// Define routes directly without using createRoutesFromElements
const router = createBrowserRouter([
  {
    element: <UserLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/booking", element: <BookingField /> },
      { path: "/opponents", element: <FindOpponents /> }
    ]
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "fields", element: <FieldManagement /> },
      { path: "feedback", element: <Feedback /> }
    ]
  },
  { path: "/api-test", element: <ApiTest /> },
  { path: "*", element: <NotFound /> }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

const App = () => {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <Sonner />
        <RouterProvider router={router} />
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;
