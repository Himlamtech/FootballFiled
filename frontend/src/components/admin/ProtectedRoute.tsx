import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoginDialog } from "./LoginDialog";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(!isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
    } else {
      setShowLoginDialog(false);
    }
  }, [isAuthenticated]);

  return (
    <>
      {children}
      <LoginDialog 
        open={showLoginDialog} 
        onOpenChange={(open) => {
          // Only allow closing if authenticated
          if (!open && !isAuthenticated) {
            return;
          }
          setShowLoginDialog(open);
        }} 
      />
    </>
  );
} 