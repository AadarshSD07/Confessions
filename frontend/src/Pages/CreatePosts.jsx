import { useState } from "react";
import LocalStorageVariables from "../Methods/LocalStorageVariables";
import axios from "axios";

export default function CreatePosts() {
  const [desc, setDesc] = useState("");

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const Submit = async (e) => {
    e.preventDefault();
    const config = LocalStorageVariables("config");

    try {
      const response = await axios.post(
        `${backendUrl}/social/user-posts/`,
        {
          desc: desc
        },
        config
      );
      if (response.status === 200){
        setDesc("");
        window.location.href = "/";
      }

    } catch (err) {
      alert(err);
      console.log("Error with request");
    }
  }
  return (
    <>
      <div className="w-75">
        <form onSubmit={Submit}>
          <div className="mb-3">
            <label htmlFor="desc" className="form-label fs-3">
              Create a New Post
            </label>
            <textarea 
              id="desc" 
              value={desc} // ✅ Using lowercase 't'
              onChange={(e) => setDesc(e.target.value)} // ✅ Lowercase 't'
              className="form-control shadow-sm" 
              placeholder='Write something...'
            />
          </div>
          <button type="submit" className="btn btn-primary px-5">
            Post
          </button>
        </form>
      </div>
    </>
  )
}