import {useState, useEffect} from 'react';
import axios from 'axios';
import Posts from "./Posts";
import ViewPostsSkimmer from '../skimmers/ViewPostsSkimmer';


export default function ViewPosts() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paginatedData, setPaginatedData] = useState("");


  const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN;
  const postsPerPage = import.meta.env.VITE_POSTS_PER_PAGE;

  const backendUrl = `${backendDomain}/social/posts/?page=1&page_size=${postsPerPage}`;
  const postEditingPermission = false;

  useEffect(() => {
    const fetchPosts = async () => {
      const config = {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("access")}`,
            "Content-Type": "application/json"
        }
      };
      try {
        setLoading(true);
        const response = await axios.get(
          backendUrl,
          config
        );
        setPaginatedData(response.data);

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

  if (loading || !paginatedData) return <ViewPostsSkimmer />;
  if (error) return <div>Error: {error}</div>;

  return (
    <>


    <h3 className='mt-4 fs-3 text-center'>All Posts</h3>


    <Posts
      pageTitle={"viewposts"}
      postEditingPermission={postEditingPermission}
      paginatedDataResults={paginatedData.results}
      permissionToDelete={paginatedData.results.permissionToDelete}
      loading={loading}
      setLoading={setLoading}
      error={error}
      setError={setError}
      pagination={paginatedData}
    />
    </>
  )
}
