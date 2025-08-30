import React, { useEffect } from 'react';

const BackgroundImage = ({ children, ignoreTheme = false }) => {
  useEffect(() => {

    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {

      document.documentElement.style.overflow = prev || '';
    };
  }, []);

  const bg = ignoreTheme
    ? "url('https://images.unsplash.com/photo-1429892494097-cccc61109f58?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')"
    : "var(--background-image-url, url('https://images.unsplash.com/photo-1429892494097-cccc61109f58?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'))";

  return (
    <>
      {}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -999,
          backgroundImage: bg,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.5) blur(5px)',
          pointerEvents: 'none'
        }}
      />

      {}
      {children}
    </>
  );
};

export default BackgroundImage;