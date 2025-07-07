import React from 'react';
import ThemeSettings from './ThemeSettings';

const Settings = () => {
  return (
    <div className='flex justify-center items-center h-[calc(100vh-5rem)]'>
      <div className='bg-sidenav-primary rounded-3xl shadow-lg p-8 max-w-3xl w-full text-text'>
        <h2 className='text-3xl font-semibold mb-6 text-center'>
          Settings
        </h2>
        <div className='p-4 rounded-xl'>
          <ThemeSettings />
        </div>
      </div>
    </div>
  );
}

export default Settings;