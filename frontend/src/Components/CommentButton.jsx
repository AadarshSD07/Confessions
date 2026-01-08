import React, { useState, useEffect, useRef } from 'react';
import LikeButton from './LikeButton';
import "../App.css"

const CommentButton = ({ comments = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localComments, setLocalComments] = useState(comments);
  const [newComment, setNewComment] = useState('');
  const commentSectionRef = useRef(null);
  const buttonRef = useRef(null);

  // Mock user data (in real app, this would come from auth context)
  const currentUser = {
    id: 1,
    name: 'You',
    avatar: '👤'
  };

  // Focus effect similar to like button
  useEffect(() => {
    const focusTimer = setTimeout(() => {
      buttonRef.current?.focus();
    }, 100);

    const blurTimer = setTimeout(() => {
      buttonRef.current?.blur();
    }, 1000);

    return () => {
      clearTimeout(focusTimer);
      clearTimeout(blurTimer);
    };
  }, []);

  // Auto-scroll to bottom when comments are added
  useEffect(() => {
    if (commentSectionRef.current && isOpen) {
      commentSectionRef.current.scrollTop = commentSectionRef.current.scrollHeight;
    }
  }, [localComments, isOpen]);

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (newComment.trim() === '') return;

    const newCommentObj = {
      id: Date.now(),
      user: currentUser,
      text: newComment.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString()
    };

    setLocalComments([...localComments, newCommentObj]);
    setNewComment('');
  };

  const formatTime = (timeString, dateString) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInDays = Math.floor((now - commentDate) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return `Today at ${timeString}`;
    } else if (diffInDays === 1) {
      return `Yesterday at ${timeString}`;
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return dateString;
    }
  };

  return (
    <div className="comment-container">
      <button 
        ref={buttonRef}
        className={`comment-button ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close comments' : 'Open comments'}
        aria-expanded={isOpen}
      >
        <div className="comment-wrapper">
          <div className="comment-ripple"></div>
          <svg 
            className="comment-icon" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12,3C17.5,3 22,6.58 22,11C22,15.42 17.5,19 12,19C10.76,19 9.57,18.82 8.47,18.5C5.55,21 2,21 2,21C4.33,18.67 4.7,17.1 4.75,16.5C3.05,15.07 2,13.14 2,11C2,6.58 6.5,3 12,3Z"></path>
          </svg>
          <div className="comment-particles" style={{ '--total-particles': 5 }}>
            {[...Array(5)].map((_, index) => (
              <div 
                key={index}
                className="comment-particle" 
                style={{
                  '--i': index + 1,
                  '--color': [
                    '#4285F4',
                    '#34A853',
                    '#FBBC05',
                    '#EA4335',
                    '#8B5CF6'
                  ][index]
                }}
              />
            ))}
          </div>
          {localComments.length > 0 && (
            <span className="comment-count">{localComments.length}</span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="comment-section">
          <div className="comment-header">
            <h3>Comments ({localComments.length})</h3>
            <button 
              className="close-comments"
              onClick={() => setIsOpen(false)}
              aria-label="Close comments"
            >
              ×
            </button>
          </div>

          <div 
            className="comments-list"
            ref={commentSectionRef}
          >
            {localComments.length === 0 ? (
              <div className="no-comments">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="2"/>
                </svg>
                <p>No comments yet</p>
                <p className="hint">Be the first to comment!</p>
              </div>
            ) : (
              localComments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-avatar">
                    {comment.user.avatar || comment.user.name.charAt(0)}
                  </div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-user">{comment.user.name}</span>
                      <span className="comment-time">
                        {formatTime(comment.time, comment.date)}
                      </span>
                    </div>
                    <div className="comment-text">{comment.text}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSubmitComment} className="comment-form">
            <div className="comment-input-wrapper">
              <div className="current-user-avatar">
                {currentUser.avatar}
              </div>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="comment-input"
                aria-label="Write a comment"
              />
              <button 
                type="submit"
                className="submit-comment"
                disabled={!newComment.trim()}
                aria-label="Submit comment"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// Example usage with initial comments
export default function CommentButtonExample() {
  const initialComments = [
    {
      id: 1,
      user: { id: 2, name: 'Alex Johnson', avatar: '👨‍💻' },
      text: 'Great post! Really enjoyed reading this.',
      time: '10:30 AM',
      date: '2024-01-10'
    },
    {
      id: 2,
      user: { id: 3, name: 'Sam Wilson', avatar: '👩‍🎨' },
      text: 'Thanks for sharing these insights!',
      time: '11:45 AM',
      date: '2024-01-10'
    },
    {
      id: 3,
      user: { id: 4, name: 'Taylor Smith', avatar: '👨‍🏫' },
      text: 'Looking forward to the next part!',
      time: '2:15 PM',
      date: '2024-01-09'
    }
  ];

  return (
    <div className="post-card">
      <h2>Post Title</h2>
      <p>This is the post content...</p>
      
      <div className="post-actions">
        <LikeButton />
        <CommentButton comments={initialComments} />
      </div>
    </div>
  );
}