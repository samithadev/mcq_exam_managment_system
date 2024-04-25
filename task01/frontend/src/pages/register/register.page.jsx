import React, { useState } from "react";
import axios from "axios";

import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleName, setRoleName] = useState("student");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim() || !roleName.trim()) {
      alert("Please fill in all the required fields");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/user", {
        email,
        password,
        roleName,
      });
      console.log(response.data);
      // Handle success, e.g., show a success message or redirect
      alert("User registered successfully!");
    } catch (error) {
      console.error("Error creating user:", error.response.data);
      // Handle error, e.g., show an error message
      alert("error register");
    }
  };

  const handleLoginClick = () => {
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <div className="border-solid border-4 p-20 ">
        <div className=" py-4">
          <h1 className=" font-bold text-2xl flex items-center justify-center ">
            Register
          </h1>
        </div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email Address</label>
          <br />
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className=" my-4 border-solid border-2 p-2"
            placeholder="Email Address"
            required
          />
          <br />
          <label htmlFor="password">Password</label>
          <br />
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className=" my-4 border-solid border-2 p-2"
            placeholder="Password"
            required
          />
          <br />

          <label htmlFor="role">Role: </label>
          <select
            id="role"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            className=" my-4 p-2"
            required
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
          <br />

          <button
            type="submit"
            className=" p-2 bg-red-600 text-white rounded-lg w-full my-4"
          >
            Register
          </button>
          <button
            onClick={handleLoginClick}
            className=" p-2 bg-slate-500 text-white rounded-lg w-full"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
