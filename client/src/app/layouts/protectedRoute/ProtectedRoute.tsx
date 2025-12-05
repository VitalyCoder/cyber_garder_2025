import { useUserStore } from "@/entities/user/model/store";
import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
  const profile = useUserStore((state) => state.profile);

  useEffect(() => {
    console.log("protectedRoute profile", profile);
  }, [profile]);

  if (!profile || !profile.nickname) {
    return (
      <Navigate
        to="/onboarding"
        replace
      />
    );
  }

  return <Outlet />;
};
