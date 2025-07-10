import React, { useState, useEffect } from "react";
import SideNav from "./SideNav";
import getPageContent from "./SwitchPage";
import AuthPage from "./AuthPage";

function App() {
  const [page, setPage] = useState("authpage");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dockVisible, setDockVisible] = useState(true);

  useEffect(() => {
    // Initialize theme from localStorage or set default dark theme
    const savedTheme = localStorage.getItem('currentTheme') || 'dark';
    const savedThemes = JSON.parse(localStorage.getItem('themes')) || {
      light: {
        '--color-text': '#333',
        '--color-background': '#dedcff',
        '--color-background-secondary': '#9d9afc',
        '--color-sidenav-primary': '#ffffff',
        '--color-sidenav-secondary': '#dedcff',
        '--color-primary': '#fbfbfe',
        '--color-secondary': '#433bff',
        '--color-tertiary': '#dedcff',
        '--color-accent': '#433bff',
        '--color-input-txt': '#2c3033',
        '--color-info-txt': '#343a40',
        '--file-border-color': '#433bff',
        '--color-timestamp': '#949ca6',
        '--button-sec': '#9a96fd',
      },
      dark: {
        '--color-text': '#e4eaeb',
        '--color-background': '#2b303b',
        '--color-background-secondary': '#1c1f26',
        '--color-sidenav-primary': '#111317',
        '--color-sidenav-secondary': '#141f38',
        '--color-primary': '#16181d',
        '--color-secondary': '#1e5680',
        '--color-tertiary': '#292e38',
        '--color-accent': '#4bb5f5',
        '--color-input-txt': '#a0a1b2',
        '--color-info-txt': '#b7b9cc',
        '--file-border-color': '#4bb5f5',
        '--color-timestamp': '#949ca6',
        '--button-sec': '#378fd1',
      }
    };

    localStorage.setItem('themes', JSON.stringify(savedThemes));
    
    // Apply theme
    const theme = savedThemes[savedTheme] || savedThemes.dark;
    Object.entries(theme).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });

    // User authentication
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.name) {
      setIsAuthenticated(true);
      setPage("start");
    }
  }, []);

  useEffect(() => {
    const handleThemeChange = () => {
      setPage(prev => prev);
    };
    
    window.addEventListener('themeChanged', handleThemeChange);
    
    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setPage("start");
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setPage("authpage");
  };

  const toggleDock = () => {
    setDockVisible(!dockVisible);
  };
  
  return (
    <div>
      {isAuthenticated ? (
        <>
          <div className={`${dockVisible ? 'pb-28' : 'pb-10'} transition-all duration-300`}>
            {getPageContent(page)}
          </div>
          <SideNav 
            setPage={setPage} 
            onLogout={handleLogout} 
            visible={dockVisible}
            toggleVisibility={toggleDock}
          />
        </>
      ) : (
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;