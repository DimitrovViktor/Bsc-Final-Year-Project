import React, { useEffect, useState } from 'react';

import ThemeSettings from './ThemeSettings';
import BackgroundImage from './BackgroundImage';
import Nav from './SideNav';
import { useNotifications } from './NotificationsContext';

const SIDENAV_HEIGHT = 96;

const Settings = () => {
  const notifications = useNotifications();
  const [muted, setMuted] = useState(() => notifications?.muted || false);

  useEffect(() => { setMuted(notifications?.muted || false); }, [notifications?.muted]);

  const handleToggleMute = () => {
    const next = !muted;
    setMuted(next);
    notifications?.setMuted(next, { reason: 'manual' });
  };

  return (
    <BackgroundImage>
      {}
      <div className="grid grid-rows-[96px_1fr] grid-cols-12 gap-4 h-screen w-full overflow-hidden">
        {}
        <div className="row-start-1 row-span-1 col-start-1 col-span-12">
          <Nav onLogout={() => { localStorage.clear(); window.location.reload(); }} visible={true} toggleVisibility={() => {}} inGrid={true} height={SIDENAV_HEIGHT} />
        </div>

        {}
        <div
          className="row-start-2 row-span-1 col-start-1 col-span-12 flex items-start justify-center h-full w-full overflow-hidden"
          style={{ paddingLeft: '1%', paddingRight: '1%', paddingBottom: '1%' }}
        >
          <div className="relative z-10 w-full max-w-full overflow-auto p-6">
            <div 
              className="bg-[color:var(--acrylic-background)] rounded-3xl shadow-2xl p-8 border-2 border-[var(--color-accent)] backdrop-blur-sm animate-fade-in"
              style={{ '--acrylic-background': 'rgba(var(--color-sidenav-primary-rgb), 0.8)' }}
            >
              <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-[var(--color-accent)] to-blue-400 text-transparent bg-clip-text'>
                Settings
              </h2>
              <div className='space-y-8'>
                <div className='p-4 rounded-xl border border-[var(--color-accent)] bg-[rgba(var(--color-sidenav-primary-rgb),0.5)]'>
                  <h3 className='text-xl font-semibold mb-4'>Theme</h3>
                  <ThemeSettings />
                </div>
                <div className='p-4 rounded-xl border border-[var(--color-accent)] bg-[rgba(var(--color-sidenav-primary-rgb),0.5)]'>
                  <h3 className='text-xl font-semibold mb-4'>Notifications</h3>
                  <div className='flex items-center justify-between'>
                    <div className='flex flex-col'>
                      <span className='font-medium'>Global Notifications</span>
                      <span className='text-xs opacity-70'>Mute popups & badges (auto-enabled in Do Not Disturb)</span>
                    </div>
                    <button
                      onClick={handleToggleMute}
                      className={`px-6 py-2 rounded-2xl text-sm font-bold border-2 shadow-lg transition-all duration-500 group
                        ${muted
                          ? 'bg-[rgba(var(--color-sidenav-primary-rgb),0.6)] border-[var(--color-accent)] text-text hover:bg-gradient-to-r hover:from-red-600 hover:to-red-500 hover:text-white'
                          : 'bg-[rgba(var(--color-sidenav-primary-rgb),0.6)] border-[var(--color-accent)] text-text hover:bg-gradient-to-r hover:from-[var(--color-accent)] hover:to-blue-500 hover:text-white'}`}
                      style={{
                        transition: 'all 0.5s cubic-bezier(0.22, 0.61, 0.36, 1)',
                        transform: 'translateY(0)'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      <span className="group-hover:drop-shadow-[0_0_6px_var(--color-accent)] transition-all duration-500">
                        {muted ? 'Muted' : 'Enabled'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BackgroundImage>
  );
}

export default Settings;
