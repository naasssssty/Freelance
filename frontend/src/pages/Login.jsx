//Login.jsx

import React, { useState } from "react";
import { login, setAuthToken } from "../services/auth";
import "../styles/auth.css";
import { jwtDecode } from "jwt-decode";
import {Link, useNavigate} from "react-router-dom";
import { useDispatch } from 'react-redux';

export const Login = () => {
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const response = await login(formData);
            const { token } = response.data;
            setAuthToken(token);
            localStorage.setItem("token", token);
            localStorage.setItem("username", formData.username);

            const decoded = jwtDecode(token);
            const role = decoded?.role;
            const isVerified = decoded?.isVerified;

            // Dispatch στο Redux store
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                    username: formData.username,
                    role: role,
                    isVerified: isVerified
                }
            });

            if (!isVerified) {
                setError("Account is not verified. Please wait for verification.");
                // Optionally, you could redirect to a verification page here
                return;
            }

            // Redirect based on the role if verified
            if (role === "ADMIN") {
                navigate("/admin/dashboard");
            } else if (role === "CLIENT") {
                navigate("/client/dashboard");
            } else if (role === "FREELANCER") {
                navigate("/freelancer/dashboard");
            } else {
                setError("Unknown role");
            }
        } catch (err) {
            console.error("Login failed:", err);
            setError("Invalid username or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="wrapper">
            <form onSubmit={handleSubmit}>
                <h1>Login</h1>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <div className="input-box">
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Username"
                        required
                    />
                </div>
                <div className="input-box">
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Password"
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? "Loading..." : "Login"}
                </button>

                {/* Login Link */}
                <div className="register-link">
                    <p>Don't have an account? <Link to="/register">Register here</Link></p>
                </div>
            </form>
        </div>
    );
};