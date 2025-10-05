import React, { useState, useEffect } from "react";
import getPageContent from "./SwitchPage";
import AuthPage from "./AuthPage";
import { NotificationsProvider, NotificationToasts } from './NotificationsContext';
import { applyThemeFromStorage } from './themeUtil';

function App() {
  const [page, setPage] = useState("authpage");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (typeof window !== 'undefined') {
    window.__setAppPage = setPage;
  }

  useEffect(() => {
    applyThemeFromStorage();

    const user = (()=>{ try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
    if (user && (user.name || user.username)) {
      setIsAuthenticated(true);
      setPage("start");
    }

    window.__setAppPage = (p) => { try { setPage(p); } catch (e) {} };
    return () => { delete window.__setAppPage; };
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__currentAppPage = page;
      window.dispatchEvent(new CustomEvent('appPageChanged', { detail: { page } }));
    }
  }, [page]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setPage("start");
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setPage("authpage");
  };

  return (
    <NotificationsProvider>
      <div>
        {isAuthenticated ? (
          <>
            <div className="transition-all duration-300">
              {getPageContent(page)}
            </div>
          </>
        ) : (
          <AuthPage onLoginSuccess={handleLoginSuccess} />
        )}
        <NotificationToasts onSelect={(channel, messageId) => {
          const isDM = String(channel).startsWith('dm_');
          if (isDM) {
            const parts = String(channel).substring(3).split('_').map(n=>Number(n)).filter(Boolean);
            const currentUserId = (()=>{ try { return JSON.parse(localStorage.getItem('user')||'{}').user_ID; } catch { return null; } })();
            const peerId = parts.find(p => p !== currentUserId) || parts[0];
            window.__setAppPage && window.__setAppPage('direct');
            setTimeout(()=>{
              window.dispatchEvent(new CustomEvent('jumpToDirectMessage', { detail: { peerId, messageId } }));
            },50);
          } else {
            window.__setAppPage && window.__setAppPage('start');
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('jumpToChannelMessage', { detail: { channelId: channel, messageId } }));
            }, 50);
          }
        }} />
      </div>
    </NotificationsProvider>
  );
}

export default App;
