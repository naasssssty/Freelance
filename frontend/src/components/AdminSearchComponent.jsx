import React, { useState } from 'react';
import { IoSearchCircleSharp } from "react-icons/io5";
import axios from 'axios';

const AdminSearchComponent = ({ onSearchResult }) => {
    const [searchUsername, setSearchUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/user/username/${searchUsername}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Καλούμε την onSearchResult με το αποτέλεσμα
            onSearchResult(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Δεν βρέθηκε χρήστης');
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
                    placeholder="Search ..."
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                />
                <button type="submit" className="search_button" disabled={loading}>
                    <i className="fas fa-search">
                        <IoSearchCircleSharp size={40}/>
                    </i>
                </button>
            </form>
            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default AdminSearchComponent;