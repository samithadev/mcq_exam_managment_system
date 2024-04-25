import React from "react";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="p-2 bg-red-600 text-white rounded-lg"
    >
      Logout
    </button>
  );
}

export default LogoutButton;
