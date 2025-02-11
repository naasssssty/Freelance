//Register.jsx

import React from "react";
import { useForm } from "react-hook-form";
import "../styles/auth.css";
import "../index.css";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import { AiOutlineUser } from "react-icons/ai";
import { MdAlternateEmail } from "react-icons/md";
import { register } from "../services/auth"; // Import the register API function

export const Register = () => {
    const {
        register: formRegister,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm();

    const navigate = useNavigate(); // To redirect after successful registration

    // Watch password field for confirm password validation
    const password = watch("password", "");

    // Form submission handler
    const onSubmit = async (data) => {
        try {
            const response = await register(data); // Call the register function from AdminServices.jsx
            console.log("Registration Successful:", response);
            navigate("/noPage"); // Redirect to NoPage after successful registration
        } catch (error) {
            console.error("Registration Failed:", error);
            // Optionally, you can display an error message to the user here
        }
    };

    return (
        <div className="wrapper">
            <form onSubmit={handleSubmit(onSubmit)}>
                <h1>Register</h1>

                {/* Username Field */}
                <div className="input-box">
                    <input
                        type="text"
                        placeholder="Username"
                        {...formRegister("username", { required: "Username is required" })}
                    />
                    <FaUser className="icon" />
                    {errors.username && <p className="error">{errors.username.message}</p>}
                </div>

                {/* Email Field */}
                <div className="input-box">
                    <input
                        type="email"
                        placeholder="Email"
                        {...formRegister("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Invalid email address",
                            },
                        })}
                    />
                    <MdAlternateEmail className="icon" />
                    {errors.email && <p className="error">{errors.email.message}</p>}
                </div>

                {/* Role Field */}
                <div className="input-box">
                    <select
                        {...formRegister("role", { required: "Please select a role" })}
                    >
                        <option value="CLIENT">Client</option>
                        <option value="FREELANCER">Freelancer</option>
                    </select>
                    <AiOutlineUser className="icon" />
                    {errors.role && <p className="error">{errors.role.message}</p>}
                </div>

                {/* Password Field */}
                <div className="input-box">
                    <input
                        type="password"
                        placeholder="Password"
                        {...formRegister("password", {
                            required: "Password is required",
                            minLength: {
                                value: 6,
                                message: "Password must be at least 6 characters",
                            },
                        })}
                    />
                    <FaLock className="icon" />
                    {errors.password && <p className="error">{errors.password.message}</p>}
                </div>

                {/* Confirm Password Field */}
                <div className="input-box">
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        {...formRegister("confirmPassword", {
                            required: "Please confirm your password",
                            validate: (value) =>
                                value === password || "Passwords do not match",
                        })}
                    />
                    <FaLock className="icon" />
                    {errors.confirmPassword && <p className="error">{errors.confirmPassword.message}</p>}
                </div>

                {/* Submit Button */}
                <button type="submit">Register</button>

                {/* Login Link */}
                <div className="register-link">
                    <p>Already have an account? <Link to="/login">Login here</Link></p>
                </div>
            </form>
        </div>
    );
};
