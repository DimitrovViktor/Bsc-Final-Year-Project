import React from 'react';

import ThemeSettings from './ThemeSettings';
import BackgroundImage from './BackgroundImage';
import SideNav from './SideNav';

const SIDENAV_HEIGHT = 96;

const Settings = () => {

  return (
    <BackgroundImage>
      {}
      <div className="grid grid-rows-[96px_1fr] grid-cols-12 gap-4 h-screen w-full overflow-hidden">
        {}
        <div className="row-start-1 row-span-1 col-start-1 col-span-12">
          <SideNav onLogout={() => { localStorage.clear(); window.location.reload(); }} visible={true} toggleVisibility={() => {}} inGrid={true} height={SIDENAV_HEIGHT} />
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
              <div className='p-4 rounded-xl'>
                <ThemeSettings />
              </div>
            </div>
          </div>
        </div>
      </div>
    </BackgroundImage>
  );
}

export default Settings;