import { jwtDecode } from "jwt-decode";

export const getTokenAndDecode = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No token found');
    }

    const decoded = jwtDecode(token);
    const username = decoded?.sub;

    if (!username) {
        throw new Error('Invalid token');
    }

    return { token, username };
}; 