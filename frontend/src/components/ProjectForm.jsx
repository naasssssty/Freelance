//ProjectForm.jsx

import React, { useState } from "react";
import { handlePostProject } from "../services/ClientServices";
import "../styles/client dashboard/projectForm.css";
import {jwtDecode} from "jwt-decode";

const ProjectForm = ({ handleFormClose }) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        budget: "",
        deadline: "",
    });

    const [loading, setLoading] = useState(false); // For API call state
    const [error, setError] = useState(null); // For error handling

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await handlePostProject(formData);
            alert("Project posted successfully!");
            handleFormClose();
        } catch (err) {
            console.error("Error posting project:", err);
            setError("Failed to post the project. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="wrapper">
            <h2>New Project</h2>
            {error && <p className="dontHaveAccount" style={{ color: "red" }}>{error}</p>}
            <form className="projectForm" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title">Title:</label>
                    <input
                        type="text"
                        placeholder="Title"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        placeholder="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="budget">Budget:</label>
                    <input
                        type="number"
                        id="budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="deadline">Deadline:</label>
                    <input
                        type="date"
                        id="deadline"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="buttons">
                <button className="projectButton" type="submit" disabled={loading}>
                    {loading ? "Posting..." : "Post Project"}
                </button>
                </div>
                <button className="projectButton" type="button" onClick={handleFormClose}>
                    Cancel
                </button>
            </form>
        </div>
    );
};

export default ProjectForm;
