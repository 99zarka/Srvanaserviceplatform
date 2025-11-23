import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export function ClientProfile() {
  const { user } = useSelector((state) => state.auth);

  if (user) {
    return <Navigate to={`/profile/${user.user_id}`} replace />;
  }

  // Fallback, though ideally user should be authenticated to reach client dashboard
  return <Navigate to="/login" replace />;
}
