import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { CiLogout, CiSettings } from "react-icons/ci";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { FaChevronUp, FaChevronDown, FaUserCircle, FaBell } from "react-icons/fa";
import Profile from './Profile';
import { NotificationsPanel, useNotifications } from './NotificationsContext';
import { GoCommentDiscussion } from 'react-icons/go';

const Nav = ({ setPage, onLogout, visible = true, toggleVisibility, inGrid = false, height = 96 }) => {

  const navigate = (pageValue) => {
    if (setPage && typeof setPage === 'function') return setPage(pageValue);
    if (typeof window !== 'undefined' && typeof window.__setAppPage === 'function') return window.__setAppPage(pageValue);

  };

  const containerCommon = `m-0 flex items-center transition-all duration-300 rounded-[60px] overflow-visible`;
  const fixedClass = `fixed top-3 left-1/2 transform -translate-x-1/2 z-50 flex flex-col relative`;
  const gridOuter = `relative w-full z-50 flex items-center justify-center`;

  const [currentUser, setCurrentUser] = useState({});
  const [showProfile, setShowProfile] = useState(false);
  const [programName, setProgramName] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsCtx = useNotifications();

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        setCurrentUser(u || {});

        if (u?.user_ID) {
          axios.get(`${API_BASE_URL}/users/${u.user_ID}/profile`).then(resp => {
            const prof = resp.data || {};
            const merged = { ...u, profile_image: prof.profile_image || u.profile_image, status: prof.status || u.status };
            setCurrentUser(merged);
            localStorage.setItem('user', JSON.stringify(merged));
          }).catch(()=>{});
        }
        if (u && (u.program_ID || u.programId)) {
          const pid = u.program_ID || u.programId;
          axios.get(`${API_BASE_URL}/programs`).then(resp => {
            const found = (resp.data || []).find(p => p.program_ID === pid || p.program_ID === Number(pid) || p.id === pid || p.id === Number(pid));
            if (found) setProgramName(found.program_name || found.name || '');
          }).catch(() => {});
        }
      } catch (e) {

      }
    }
  }, []);

  return (
    <>
      <div
        className={`${inGrid ? gridOuter : fixedClass} ${containerCommon} ${visible ? 'translate-y-0 opacity-100' : `${inGrid ? 'opacity-100' : '-translate-y-[200%] opacity-0'}`}`}
        style={inGrid ? { height: `${height}px`, pointerEvents: 'auto' } : undefined}
      >
    {}
    <div className="absolute left-8 top-1/2 transform -translate-y-1/2">
          <div className="inline-flex items-center p-2 rounded-[40px]" style={{ background: 'rgba(var(--color-sidenav-primary-rgb), 0.8)', border: '3px solid var(--color-accent)', boxShadow: '0 10px 30px rgba(var(--color-accent-rgb),0.35)', gap: '8px' }}>
      <button onClick={() => setShowProfile(true)} className="flex items-center justify-center h-12 w-12 rounded-full bg-[rgba(var(--color-tertiary-rgb),0.7)] text-accent shadow-md hover:bg-[rgba(var(--color-accent-rgb),0.4)] transition-all duration-200 overflow-hidden" title="Profile">
              {currentUser.profile_image ? (
                <img src={currentUser.profile_image} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <FaUserCircle size={28} />
              )}
            </button>
            <div className="text-left ml-2">
              <div className="text-sm font-bold text-text">{currentUser.username || currentUser.name || 'Guest'}</div>
              <div className="text-xs text-text/80">{currentUser.programme || currentUser.program || currentUser.course || ''}</div>
            </div>
          </div>
        </div>

  {}
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
          <div className="inline-flex items-center p-2 rounded-[40px]" style={{ background: 'rgba(var(--color-sidenav-primary-rgb), 0.8)', border: '3px solid var(--color-accent)', boxShadow: '0 10px 30px rgba(var(--color-accent-rgb),0.35)', gap: '8px' }}>
            <div className="text-left mr-3">
              <div className="text-sm font-bold text-text">Notifications</div>
            </div>
            <button onClick={() => setShowNotifications(s=>!s)} className="relative flex items-center justify-center h-12 w-12 rounded-full bg-[rgba(var(--color-tertiary-rgb),0.7)] text-accent shadow-md hover:bg-[rgba(var(--color-accent-rgb),0.4)] transition-all duration-200" title="Notifications">
              <FaBell size={20} />
              {!!notificationsCtx && notificationsCtx.items.some(i=>i.unreadCount>0) && (
                <span className="absolute -top-1 -right-1 bg-[var(--color-accent)] text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {notificationsCtx.items.reduce((a,b)=>a+(b.unreadCount>0?1:0),0)}
                </span>
              )}
            </button>
          </div>
        </div>

  {}

        {}
        <div
          className="inline-flex items-center p-2 rounded-[40px]"
          style={{
            background: 'rgba(var(--color-sidenav-primary-rgb), 0.8)',
            border: '3px solid var(--color-accent)',
            boxShadow: '0 15px 40px rgba(var(--color-accent-rgb), 0.4)',
            gap: '8px'
          }}
        >

          <div className="inline-flex items-center">
            <NavIcon icon={<AiOutlineUsergroupAdd size="40" />} onClick={() => navigate('start')} />
            <NavIcon icon={<GoCommentDiscussion size="33" />} onClick={() => navigate('direct')} />
            <NavIcon icon={<CiSettings size="40" />} onClick={() => navigate('settings')} />
            <NavIcon icon={<CiLogout size="35" />} onClick={onLogout} extraClasses="hover:bg-red-500 hover:text-white" />
          </div>
        </div>
      </div>

      {}
      {showProfile && typeof document !== 'undefined' && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" onClick={() => setShowProfile(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-[10000] w-full max-w-sm p-6 rounded-2xl" onClick={(e) => e.stopPropagation()} style={{ background: 'rgba(var(--color-sidenav-primary-rgb), 0.95)', border: '2px solid var(--color-accent)', boxShadow: '0 10px 40px rgba(0,0,0,0.6)' }}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-text">Profile</h3>
              <button onClick={() => setShowProfile(false)} className="text-sm text-text/70 hover:text-text">X</button>
            </div>
            <div className="space-y-4">
              <Profile user={currentUser} onUpdateLocalUser={(u) => { setCurrentUser(u); localStorage.setItem('user', JSON.stringify(u)); }} />
              <div>
                <div className="text-xs font-bold text-text/70">Programme</div>
                <div className="text-sm font-semibold text-text">{programName || currentUser.programme || currentUser.program || currentUser.course || ''}</div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showNotifications && typeof document !== 'undefined' && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9998] flex items-end justify-end p-4" onClick={() => setShowNotifications(false)}>
          <div className="absolute inset-0" />
          <div className="relative w-full max-w-sm p-5 rounded-2xl" onClick={(e)=>e.stopPropagation()} style={{ background: 'rgba(var(--color-sidenav-primary-rgb),0.95)', border: '2px solid var(--color-accent)' }}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-text">Notifications</h3>
              <button className="text-xs opacity-70" onClick={()=>setShowNotifications(false)}>Close</button>
            </div>
            <NotificationsPanel onSelect={(channelId, messageId) => {

              if (String(channelId).startsWith('dm_')) {
                const parts = String(channelId).substring(3).split('_').map(n=>Number(n)).filter(Boolean);
                const currentUserId = (()=>{ try { return JSON.parse(localStorage.getItem('user')||'{}').user_ID; } catch { return null; } })();
                const peerId = parts.find(p => p !== currentUserId) || parts[0];
                window.__setAppPage && window.__setAppPage('direct');
                setTimeout(()=>{
                  window.dispatchEvent(new CustomEvent('jumpToDirectMessage', { detail: { peerId, messageId } }));
                  setShowNotifications(false);
                },50);
              } else {
                window.__setAppPage && window.__setAppPage('start');
                setTimeout(()=>{
                  window.dispatchEvent(new CustomEvent('jumpToChannelMessage', { detail: { channelId, messageId } }));
                  setShowNotifications(false);
                },50);
              }
            }} />
          </div>
        </div>, document.body)
      }

      {}
      {!inGrid && !visible && (
        <button
          onClick={toggleVisibility}
          className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50 flex items-center justify-center h-12 w-12 bg-gradient-to-r from-accent/80 to-blue-500/80 text-white rounded-full shadow-lg hover:from-blue-600/80 hover:to-accent-dark/80 transition-all duration-300 ease-linear cursor-pointer group"
          style={{
            boxShadow: '0 8px 25px rgba(var(--color-accent-rgb), 0.7)',
            border: '2px solid rgba(var(--color-accent-rgb), 0.6)'
          }}
          title="Show nav"
        >
          <FaChevronUp className="text-white" size={18} />
        </button>
      )}
    </>
  );
};

const NavIcon = ({ icon, onClick, extraClasses = "" }) => {
  return (
    <div className="flex items-center mx-1">
      <div
        onClick={() => { if (onClick) onClick(); }}
        className={`flex rounded-[40px] items-center justify-center h-12 w-12 bg-[rgba(var(--color-tertiary-rgb),0.7)] text-accent shadow-lg hover:bg-[rgba(var(--color-accent-rgb),0.4)] transition-all duration-300 ease-linear cursor-pointer group ${extraClasses}`}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => { if (e.key === 'Enter' && onClick) onClick(); }}
      >
        <span className="group-hover:text-white transition-colors">
          {icon}
        </span>
      </div>
    </div>
  );
}

export default Nav;
