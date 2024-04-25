import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Please fill in all the required fields");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/user/login", {
        email,
        password,
      });

      const { token } = response.data;
      localStorage.setItem("token", token);

      const decodedToken = jwtDecode(token);
      const role = decodedToken.role;

      // Redirect based on user role
      if (role === 1) {
        navigate("/teacher/dashboard"); // Navigate to teacher dashboard
      } else if (role === 2) {
        navigate("/student/dashboard"); // Navigate to student dashboard
      }
      console.log(response.data);
      // Handle successful login, e.g., redirect to dashboard
      alert("login successfull!!");
    } catch (error) {
      alert("Not registerd User!");
      console.error("Error logging in:", error.response.data);
      // Handle error, e.g., show an error message
    }
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <div className="border-solid border-4 p-20 ">
        <div className=" py-4">
          <h1 className=" font-bold text-2xl flex items-center justify-center ">
            Login
          </h1>
        </div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email Address</label>
          <br />
          <input
            type="email"
            id="email"
            className=" my-4 border-solid border-2 p-2"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <br />
          <label htmlFor="password">Password</label>
          <br />
          <input
            type="password"
            id="password"
            className=" my-4 border-solid border-2 p-2"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />

          <button
            type="submit"
            className=" p-2 bg-blue-600 text-white rounded-lg w-full my-4"
          >
            LogIn
          </button>
          <button
            onClick={handleRegisterClick}
            className=" p-2 bg-red-600 text-white rounded-lg w-full "
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
