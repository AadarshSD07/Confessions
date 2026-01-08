import React, { useEffect, useRef } from 'react';
import "../App.css"

const LikeButton = () => {
  const buttonRef = useRef(null);

  useEffect(() => {
    // Focus and blur effects using refs instead of querySelector
    const timer1 = setTimeout(() => {
      if (buttonRef.current) {
        buttonRef.current.focus();
      }
    }, 100);

    const timer2 = setTimeout(() => {
      if (buttonRef.current) {
        buttonRef.current.blur();
      }
    }, 1000);

    // Cleanup timers on unmount
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Inline styles converted to React style object or CSS custom properties
  const particlesStyle = {
    '--total-particles': 6
  };

  return (
    <button 
      ref={buttonRef}
      className="like-button"
      aria-label="Like"
    >
      <div className="like-wrapper">
        <div className="ripple"></div>
        <svg 
          className="heart" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"></path>
        </svg>
        <div 
          className="particles" 
          style={particlesStyle}
        >
          {[...Array(6)].map((_, index) => (
            <div 
              key={index}
              className="particle" 
              style={{
                '--i': index + 1,
                '--color': [
                  '#7642F0',
                  '#AFD27F',
                  '#DE8F4F',
                  '#D0516B',
                  '#5686F2',
                  '#D53EF3'
                ][index]
              }}
            />
          ))}
        </div>
      </div>
    </button>
  );
};

export default LikeButton;