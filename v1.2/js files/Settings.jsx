import React from 'react';

import ThemeSettings from './ThemeSettings';

import BackgroundImage from './BackgroundImage';



const Settings = () => {

  return (

    <BackgroundImage>

      <div className="relative z-10 w-full max-w-full">

        <div 

          className="bg-[color:var(--acrylic-background)] rounded-3xl shadow-2xl p-8 border-2 border-[var(--color-accent)] backdrop-blur-sm animate-fade-in"

          style={{

            '--acrylic-background': 'rgba(var(--color-sidenav-primary-rgb), 0.8)'

          }}

        >

          <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-[var(--color-accent)] to-blue-400 text-transparent bg-clip-text'>

            Settings

          </h2>

          <div className='p-4 rounded-xl'>

            <ThemeSettings />

          </div>

        </div>

      </div>

    </BackgroundImage>

  );

}



export default Settings;