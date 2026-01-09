import { useState, useEffect } from 'react';
import axios from "axios";
import getTimeAgo from '../Methods/TimestampCalculation';
import LocalStorageVariables from '../Methods/LocalStorageVariables';
import '../CSS/LikeButton.css';

const SocialPost = (props) => {
  const [userInformation, setUserInformation] = useState([]);
  const [liked, setLiked] = useState(props.userLiked);
  const [likeCount, setLikeCount] = useState(props.likesCount);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(props.userComments);
  let commentsLength = comments ? comments.length : 0;
  const [newComment, setNewComment] = useState('');

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const config = LocalStorageVariables("config");

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
          const response = await axios.get(`${backendUrl}/header/`, config);
          setUserInformation(response.data);
      } catch (err) {
          console.error('Error:', err);
      }
    };

    fetchUserDetails();
  }, []);

  const handleLike = async () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);

    // API call to Django backend
    try {
      const response = await fetch(`${backendUrl}/social/like/${props.postId}/`, {
        method: 'POST',
        headers: config["headers"],
        body: JSON.stringify({ liked: !liked })
      });
      const data = await response.json();
      // Handle response if needed
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const comment = {
      id: commentsLength + 1,
      user: userInformation["fullName"],
      userImage: userInformation["userImage"],
      comment: newComment,
      timestamp: 'Just now'
    };

    setComments([comment, ...comments]);
    setNewComment('');

    // API call to Django backend
    fetch(`${backendUrl}/social/comment/${props.postId}/`, {
      method: 'POST',
      headers: config["headers"],
      body: JSON.stringify({ comment: newComment })
    })
    .then(response => response.json())
    .then(data => {
      console.log("Comment sent successfully")
    })
    .catch(error => {
      console.error('Error posting comment:', error);
    });
  };

  return (
    <>
    <div>
      {/* Action Buttons */}
      <div className="post-actions">
        <button className={`action-btn like-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
          <svg
            className="icon"
            viewBox="0 0 24 24"
            fill={liked ? '#ff0000' : 'none'}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span>{likeCount} Likes</span>
        </button>

        <button className="action-btn comment-btn" onClick={() => setShowComments(!showComments)}>
          <svg
            className="icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>{commentsLength} Comments</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="comments-section">
          <div className="comment-form">
            <img src={`${backendUrl}${userInformation["userImage"]}`} alt="Your avatar" className="comment-avatar"/>
            <input type="text" placeholder="Write a comment..." value={newComment}
              onChange={(e) => setNewComment(e.target.value)} className="comment-input"
              onKeyDown={(e) => {
                // Check for Enter key and ensure the comment isn't just whitespace
                if (e.key === 'Enter' && newComment.trim()) {
                  handleCommentSubmit(e);
                }
              }}
              />
            <button onClick={handleCommentSubmit} className="comment-submit">Post</button>
          </div>

          <div className="comments-list">
            { commentsLength < 1 ? (
              <p className='text-center'>Be the first to comment</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <img src={`${backendUrl}${comment.userImage}`} alt={comment.user} className="comment-avatar"/>
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-user">{comment.user}</span>
                      <span className="comment-time">{
                      comment.timestamp === "Just now" ? comment.timestamp : getTimeAgo(comment.timestamp)
                      }</span>
                    </div>
                    <p className="comment-text">{comment.comment}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default SocialPost;