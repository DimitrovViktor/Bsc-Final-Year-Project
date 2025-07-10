import React from 'react';

const BackgroundImage = ({ children, ignoreTheme = false }) => {
  return (
    <div className="flex justify-center items-center min-h-screen relative overflow-hidden">
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: ignoreTheme 
            ? "url('https://images.unsplash.com/photo-1429892494097-cccc61109f58?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" 
            : "var(--background-image-url, url('https://images.unsplash.com/photo-1429892494097-cccc61109f58?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'))",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.5) blur(5px)',
          transform: 'scale(1.05)',
        }}
      />
      
      <div className="relative z-10 w-full max-w-4xl px-4">
        {children}
      </div>
    </div>
  );
};

export default BackgroundImage;