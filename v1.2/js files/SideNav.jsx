import React from 'react';
import { CiLogout } from "react-icons/ci";
import { CiSettings } from "react-icons/ci";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { GoCommentDiscussion } from 'react-icons/go';

const SideNav = ({ setPage, onLogout, visible, toggleVisibility }) => {
  return (
    <>
      <div 
        className={`fixed top-3 left-1/2 transform -translate-x-1/2 z-50 m-0 flex flex-col items-center transition-all duration-300 rounded-[60px] overflow-hidden backdrop-blur-xl ${
          visible ? 'translate-y-0 opacity-100' : '-translate-y-[200%] opacity-0'
        }`}
        style={{
          background: 'rgba(var(--color-sidenav-primary-rgb), 0.8)',
          border: '3px solid var(--color-accent)',
          boxShadow: '0 15px 40px rgba(var(--color-accent-rgb), 0.4)',
        }}
      >
        <div className="flex flex-row p-4">
          <button 
            onClick={toggleVisibility}
            className="flex rounded-[40px] items-center justify-center h-12 w-12 mx-2 bg-[rgba(var(--color-tertiary-rgb),0.7)] text-accent shadow-lg hover:bg-[rgba(var(--color-accent-rgb),0.4)] transition-all duration-300 ease-linear cursor-pointer group"
          >
            <FaChevronDown 
              className={`text-accent transition-transform duration-300 group-hover:text-white ${
                visible ? 'rotate-180' : ''
              }`} 
              size={24} 
            />
          </button>
          <SideNavIcon 
            icon={<AiOutlineUsergroupAdd size="40" />} 
            setPage={setPage} 
            pageValue={"start"} 
          />
          <SideNavIcon 
            icon={<GoCommentDiscussion size="33" />} 
            setPage={setPage} 
            pageValue={"direct"} 
          />
          <SideNavIcon 
            icon={<CiSettings size="40" />} 
            setPage={setPage} 
            pageValue={"settings"} 
          />
          <SideNavIcon 
            icon={<CiLogout size="35" />} 
            onClick={onLogout} 
            extraClasses="hover:bg-red-500 hover:text-white"
          />
        </div>
      </div>
      
      {!visible && (
        <button
          onClick={toggleVisibility}
          className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50 flex items-center justify-center h-12 w-12 bg-gradient-to-r from-accent/80 to-blue-500/80 text-white rounded-full shadow-lg hover:from-blue-600/80 hover:to-accent-dark/80 transition-all duration-300 ease-linear cursor-pointer group"
          style={{ 
            boxShadow: '0 8px 25px rgba(var(--color-accent-rgb), 0.7)',
            border: '2px solid rgba(var(--color-accent-rgb), 0.6)'
          }}
        >
          <FaChevronUp 
            className="text-white" 
            size={18} 
          />
        </button>
      )}
    </>
  );
};

const SideNavIcon = ({ icon, setPage, pageValue, onClick, extraClasses = "", label }) => {
  const handleClick = () => {
    if (setPage && pageValue) setPage(pageValue);
    if (onClick) onClick();
  };

  return (
    <div className="flex flex-col items-center mx-2">
      <div 
        onClick={handleClick}
        className={`flex rounded-[40px] items-center justify-center h-12 w-12 bg-[rgba(var(--color-tertiary-rgb),0.7)] text-accent shadow-lg hover:bg-[rgba(var(--color-accent-rgb),0.4)] transition-all duration-300 ease-linear cursor-pointer group ${extraClasses}`}>
        <span className="group-hover:text-white transition-colors ">
          {icon}
        </span>
      </div>
      <span className="text-xs mt-1.5 text-text group-hover:text-white transition-colors">
        {label}
      </span>
    </div>
  );
}

export default SideNav;