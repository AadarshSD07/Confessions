import { useState, useEffect, useRef } from "react";
import LocalStorageVariables from "../Methods/LocalStorageVariables";
import axios from "axios";

export default function Profile() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("");
    const [firstname, setFirstname] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [lastname, setLastname] = useState("");
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState("");

    const fileInputRef = useRef(null);

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
                    setLoading(false);
                    setUsername(response.data["username"]);
                    setFirstname(response.data["first_name"]);
                    setLastname(response.data["last_name"]);
                    setEmail(response.data["email"]);
                    setImageUrl(response.data["imageUrl"]);
                } else {
                    setLoading(false);
                    alert("Status " + response.status.toString() + ": " + response.statusText.toString());
                }
            } catch (err) {
                setLoading(false);
                alert(err);
                console.log("Error with request");
            }
        }
        fetchUserDetails();
    }, []);

    // Handle image selection
    const handleImageChange = (e) => {
        debugger
        const file = e.target.files[0];
        if (file) {
        setImageFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
        }
    };

    // Handle image upload to backend
    const handleUpload = async () => {
        if (!imageFile) return;
        const formData = new FormData();
        formData.append('image', imageFile);
        try {
            debugger
            const response = await fetch('/api/upload-profile-image', {
                method: 'POST',
                body: formData,
        });
        const data = await response.json();
        if (data.success) {
            setImageUrl(data.imageUrl);
            setImagePreview('');
            setImageFile(null);
        }
        } catch (error) {
        console.error('Error uploading image:', error);
        }
    };

    // Trigger file input click
    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const Submit = async (e) => {
        e.preventDefault();
        let userPostData = {
            username: username,
            first_name: firstname,
            last_name: lastname,
            email: email,
            imageUrl: imageFile
        }
        const config = LocalStorageVariables("config");
        try {
            debugger
            const response = await axios.post(
                `${backendUrl}/accounts/user-details/`,
                userPostData,
                config
            );
            debugger
            if (response.status === 200){
                setStatus("Data saved successfully!");
                window.location.href = "/profile";
            }

        } catch (err) {
            alert(err);
            console.log("Error with request");
        }
    }

    if (loading) {
        return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Loading...</h2>
        </div>
        );
    }

    return (
        <>
        <div className="w-25 container">
            {status && (
                <div className="alert alert-success" role="alert">
                {status}
                </div>
            )}
            <form onSubmit={Submit}>
                <div className="row">
                    <div className="col">
                        <div className="image-upload-container">
                            <div className="avatar-preview-container">
                                {/* Default/Current Image */}
                                <div className="relative group" onClick={handleAvatarClick}>
                                    {imagePreview ? (
                                        // Show selected image preview
                                        <img src={imagePreview} alt="Preview"
                                            className="avatar-profile w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />
                                    ) : imageUrl ? (
                                        // Show backend image if available
                                        <img src={`${backendUrl}${imageUrl}`} alt="User"
                                            className="avatar-profile w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />
                                    ) : (
                                        // Fallback if no image
                                        <div className="avatar-profile bg-gray-200 flex items-center justify-center cursor-pointer">
                                            <span className="text-gray-500">No Image</span>
                                        </div>
                                    )}
                                </div>

                                {/* Hidden file input */}
                                <input id="userImage" type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden mt-4" />
                            </div>

                            {/* Upload button (only show when image is selected) */}
                            {imageFile && (
                                <div className="mt-4 space-x-2">
                                    <button onClick={handleUpload}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                            Upload Image
                                    </button>
                                    <button onClick={() => { setImageFile(null); setImagePreview(''); }}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors" >
                                            Cancel
                                    </button>
                                </div>
                            )}

                            {/* Help text */}
                            <p className="text-sm text-gray-500 mt-2">
                                Click the image to upload a new profile picture
                            </p>
                        </div>
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
                        <label htmlFor="email" className="form-label">
                        Email
                        </label>
                        <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control shadow-sm" 
                        placeholder="email" />
                    </div>
                </div>
                <div className="mb-3 row">
                    <div className="col">
                        <button type="submit" className="btn btn-primary w-100" >
                            Change
                        </button>
                    </div>
                </div>
            </form>
        </div>
        </>
    )
}
