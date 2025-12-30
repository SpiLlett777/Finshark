import React from "react";
import { useLocation } from "react-router";
import { useAuth } from "../Context/useAuth.tsx";
import { Navigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

const ProtectedRoutes = ({ children }: Props) => {
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  return isLoggedIn() ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default ProtectedRoutes;
