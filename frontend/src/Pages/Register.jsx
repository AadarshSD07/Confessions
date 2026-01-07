import { useState } from "react";
import Header from "../Components/Header";
import axios from "axios";

const Register = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [loading, setLoading] = useState(false);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Create FormData object
        const formData = new FormData();

        // Add text fields
        formData.append('username', username);
        formData.append('email', email);
        formData.append('first_name', firstname);
        formData.append('last_name', lastname);
        formData.append('password', password);

        try {
            const response = await axios.post(
                `${backendUrl}/auth/register/`,
                {
                username: username,
                email: email,
                password: password,
                }
            );

            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);
            window.location.href = "/";
        } catch (err) {
            setError("Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <h1 className="text-center pt-4">Register</h1>
        <div className='container-md py-3 field-width'>
            <form onSubmit={handleSubmit}>
                {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
                )}
                
                <div className="form-group mt-2">
                    <label htmlFor="username">Username</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="form-control"
                        placeholder="Username" id="username" minLength="3" maxLength="150" disabled={loading} required />
                </div>

                <div className="form-group mt-2">
                    <label htmlFor="email">Email</label>
                    <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control"
                        placeholder="Email" id="email" minLength="3" maxLength="150" disabled={loading} required />
                </div>

                <div className="form-group mt-2 row">
                    <div className="col">
                        <label htmlFor="firstname" className="form-label">
                        First Name
                        </label>
                        <input id="firstname" value={firstname} onChange={(e) => setFirstname(e.target.value)} className="form-control shadow-sm" 
                        type="text" placeholder="first name" required />
                    </div>
                    <div className="col">
                        <label htmlFor="lastname" className="form-label">
                        Last Name
                        </label>
                        <input id="lastname" value={lastname} onChange={(e) => setLastname(e.target.value)} className="form-control shadow-sm" 
                        type="text" placeholder="last name" required />
                    </div>
                </div>
                
                <div className="form-group mt-2">
                    <label htmlFor="password">Create Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-control" 
                        placeholder="Password" id="password" minLength="8" disabled={loading} required />

                    <small className="form-text text-muted">Password must be at least 8 characters long.</small>
                </div>
                
                <button type="submit" className="btn btn-primary mt-2" disabled={loading}>
                    {loading ? 'Logging in...' : 'SIGN UP'}
                </button>
            </form>
        </div>
        </>
    )
}

export default Register
