import { useState, useEffect } from "react";
import LocalStorageVariables from "../Methods/LocalStorageVariables";
import axios from "axios";

export default function Profile() {
    const [username, setUsername] = useState("");
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    useEffect(() => {
        const fetchUserDetails = async () => {
            const config = LocalStorageVariables("config");
            try {
                const response = await axios.get(
                    `${backendUrl}/accounts/user-details/`,
                    config
                );
                if (response.status === 200){
                    setUsername(response.data["username"]);
                    setFirstname(response.data["firstName"]);
                    setLastname(response.data["lastName"]);
                    setImageUrl(response.data["imageUrl"]);
                } else {
                    alert("Status " + response.status.toString() + ": " + response.statusText.toString());
                }
            } catch (err) {
                alert(err);
                console.log("Error with request");
            }
        }
        fetchUserDetails();
    });

    const Submit = async (e) => {
        e.preventDefault();
        const config = LocalStorageVariables("config");
        try {
            const response = await axios.post(
                `${backendUrl}/accounts/user-details/`,
            {
                username: username,
                firstname: firstname,
                lastname: lastname
            },
            config
            );
            if (response.status === 200){
                window.location.href = "/";
            }

        } catch (err) {
            alert(err);
            console.log("Error with request");
        }
    }
    return (
        <>
        <div className="w-25 container">
            <form onSubmit={Submit}>
                <div className="mb-3 row">
                    <div className="col">
                        <img src={`${backendUrl}/${imageUrl}`} alt="User" className="avatar-profile"/>
                    </div>
                </div>
                <div className="mb-3 row">
                    <div className="col">
                        <label htmlFor="username" className="form-label">
                        Username
                        </label>
                        <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="form-control shadow-sm" 
                        placeholder="username" />
                    </div>
                </div>
                <div className="mb-3 row">
                    <div className="col">
                        <label htmlFor="firstname" className="form-label">
                        First Name
                        </label>
                        <input id="firstname" value={firstname} onChange={(e) => setFirstname(e.target.value)} className="form-control shadow-sm" 
                        type="text" placeholder="first name" />
                    </div>
                    <div className="col">
                        <label htmlFor="lastname" className="form-label">
                        Last Name
                        </label>
                        <input id="lastname" value={lastname} onChange={(e) => setLastname(e.target.value)} className="form-control shadow-sm" 
                        type="text" placeholder="last name" />
                    </div>
                </div>
                <div className="mb-3 row">
                    <div className="col">
                        <button type="submit" className="btn btn-primary w-100" disabled>
                            Change
                        </button>
                    </div>
                </div>
            </form>
        </div>
        </>
    )
}
