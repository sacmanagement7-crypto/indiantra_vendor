import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../helper/tokenHelper";

const ProtectedRoute = () => {
  const token = getToken();
  const user = JSON.parse(localStorage.getItem("user"));
  console.log(user)
  
  if (user.status == 'suspended') {
    // Logged in but suspended
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "1.5rem",
          color: "#555",
        }}
      >
        Your account is suspended. Please contact support.
      </div>
    );
  }

  return token ? <Outlet /> : <Navigate to="/auth/sign-in" replace />;
};

export default ProtectedRoute;
