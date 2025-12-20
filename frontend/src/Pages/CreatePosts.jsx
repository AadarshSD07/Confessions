import { useState } from "react";
import axios from "axios";
import Toasts from "../Components/Toasts";

export default function CreatePosts() {
  const [desc, setDesc] = useState("");
  // const [showToast, setSetToast] = useState(false);

  const Submit = async (e) => {
    e.preventDefault();
    const access = localStorage.getItem("access");
    const config = {
    headers: {
            'Authorization': `Bearer ${access}`,
            'Content-Type': 'application/json'
        }
    };
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/social/user-posts/",
        {
          desc: desc
        },
        config
      );
      if (response.status === 200){
        setDesc("");
      }

    } catch (err) {
      alert(err);
      console.log("Error with request");
    }
  }
  const styles = {
    minWidth: "60rem"
  };
  return (
    <>
      <div className='p-4' style={styles}>
        <form onSubmit={Submit}>
          <div className="mb-3">
            <h6>Welcome, John (Admin)</h6>
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
        {/* {showToast && <Toasts />} */}
      </div>
    </>
  )
}