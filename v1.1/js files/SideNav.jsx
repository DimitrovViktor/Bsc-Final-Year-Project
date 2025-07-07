import React from 'react';
import { ImExit } from "react-icons/im";
import { FaGear } from "react-icons/fa6";
import { IoChatbubbles } from "react-icons/io5";
import { RiTeamFill } from "react-icons/ri";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

const SideNav = ({ setPage, onLogout, visible, toggleVisibility }) => {
  return (
    <>
      <div 
        className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 m-0 flex flex-col items-center transition-all duration-300 glow-effect rounded-t-2xl overflow-hidden ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex flex-row bg-sidenav-primary rounded-t-2xl shadow-xl p-2">
          <SideNavIcon icon={<RiTeamFill size="28" />} setPage={setPage} pageValue={"start"} />
          <SideNavIcon icon={<IoChatbubbles size="28" />} setPage={setPage} pageValue={"direct"} />
          <SideNavIcon icon={<FaGear size="28" />} setPage={setPage} pageValue={"settings"} />
          <SideNavIcon 
            icon={<ImExit size="28" />} 
            onClick={onLogout} 
            extraClasses="hover:bg-red-500 hover:text-white"
          />
          <button 
            onClick={toggleVisibility}
            className="flex rounded-full items-center justify-center h-12 w-12 mx-2 bg-tertiary text-accent shadow-lg hover:bg-white transition-all duration-200 ease-linear cursor-pointer group"
          >
            <FaChevronUp 
              className={`text-accent transition-transform duration-300 group-hover:text-black ${
                visible ? 'rotate-180' : ''
              }`} 
              size={20} 
            />
          </button>
        </div>
      </div>
      
      {!visible && (
        <button
          onClick={toggleVisibility}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center justify-center h-8 w-8 bg-accent text-white rounded-full shadow-lg hover:bg-white hover:text-accent transition-all duration-200 ease-linear cursor-pointer group"
        >
          <FaChevronDown 
            className="text-white group-hover:text-accent transition-colors" 
            size={16} 
          />
        </button>
      )}
    </>
  );
};

const SideNavIcon = ({ icon, setPage, pageValue, onClick, extraClasses = "" }) => {
  const handleClick = () => {
    if (setPage && pageValue) setPage(pageValue);
    if (onClick) onClick();
  };

  return (
    <div 
      onClick={handleClick}
      className={`flex rounded-full items-center justify-center h-12 w-12 mx-2 bg-tertiary text-accent shadow-lg hover:bg-white transition-all duration-200 ease-linear cursor-pointer group ${extraClasses}`}>
      <span className="group-hover:text-black transition-colors">
        {icon}
      </span>
    </div>
  );
}

export default SideNav;