import {useState, useEffect} from 'react';
import axios from 'axios';
import DashboardProfile from '../Components/DashboardProfile';
import Posts from "./Posts";

export default function Dashboard() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paginatedData, setPaginatedData] = useState("");
  const [userInfo, setUserInfo] = useState({});

  const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN;
  const postsPerPage = import.meta.env.VITE_POSTS_PER_PAGE;

  const backendUrl = `${backendDomain}/social/posts/?post_type=dashboard&page=1&page_size=${postsPerPage}`;
  const postEditingPermission = true;

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
        setUserInfo(response.data.results.userDashboardInformation);
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

  if (loading || !paginatedData) return <div>Loading posts...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
    <DashboardProfile
        userInfo={userInfo}
        backendDomain={backendDomain}
        postsCount={paginatedData.count}
    />
    <Posts
      pageTitle={"dashboard"}
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
