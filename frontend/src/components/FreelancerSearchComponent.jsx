import React, { useState } from "react";
import { IoSearchCircleSharp } from "react-icons/io5";
import { searchProjectsByTitle } from "../services/FreelancerServices";

const FreelancerSearchComponent = ({ onSearchResult }) => {
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!title.trim()) {
            setError("Παρακαλώ εισάγετε έναν τίτλο έργου.");
            setLoading(false);
            return;
        }

        try {
            const result = await searchProjectsByTitle(title);
            if (result.length > 0) {
                onSearchResult(result[0]);
            } else {
                setError("Δεν βρέθηκε έργο με αυτόν τον τίτλο.");
                onSearchResult(null);
            }
        } catch (err) {
            setError("Σφάλμα κατά την αναζήτηση έργου. Δοκιμάστε ξανά.");
            onSearchResult(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="search">
            <form className="search_form" onSubmit={handleSearch}>
                <input
                    type="text"
                    className="search_input"
                    placeholder="Search project..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <button type="submit" className="search_button" disabled={loading}>
                    <i className="fas fa-search">
                        <IoSearchCircleSharp size={40} />
                    </i>
                </button>
            </form>
            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default FreelancerSearchComponent;