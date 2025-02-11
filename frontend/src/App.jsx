import './App.css';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import Home from "./pages/Home";
import NoPage from "./pages/NoPage";
import { PrivateRoute } from './components/PrivateRoute';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import FreelancerDashboard from "./pages/FreelancerDashboard";


function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Admin Route */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <PrivateRoute role="ADMIN">
                            <AdminDashboard />
                        </PrivateRoute>
                    }
                />

                {/* Protected Client Route */}
                <Route
                    path="/client/dashboard"
                    element={
                        <PrivateRoute role="CLIENT">
                            <ClientDashboard />
                        </PrivateRoute>
                    }
                />

                {/* Protected Freelancer Route */}
                <Route
                    path="/freelancer/dashboard"
                    element={
                        <PrivateRoute role="FREELANCER">
                            <FreelancerDashboard />
                        </PrivateRoute>
                    }
                />
                {/* Catch-all route */}
                <Route path="*" element={<NoPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;