import {useState, useEffect} from 'react'
import LocalStorageVariables from '../Methods/LocalStorageVariables';
import Posts from "./Posts";
import axios from 'axios';

export default function Dashboard() {
  const [getPostsData, setGetPostsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN;
  const backendUrl = `${backendDomain}/social/user-posts/`;
  const config = LocalStorageVariables("config");
  const postEditingPermission = true;
  const permissionToDelete = true;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(backendUrl, config);
        setGetPostsData(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <>
    <h3 className='fs-3'>Self Posts</h3>
    <Posts
      pageTitle={"dashboard"}
      postEditingPermission={postEditingPermission}
      getPostsData={getPostsData}
      permissionToDelete={permissionToDelete}
      loading={loading}
      setLoading={setLoading}
      error={error}
      setError={setError}
    />
    </>
  )
}
