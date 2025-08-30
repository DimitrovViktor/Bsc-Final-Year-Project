import React from 'react';
import { CiLogout } from "react-icons/ci";
import { CiSettings } from "react-icons/ci";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { GoCommentDiscussion } from 'react-icons/go';

const SideNav = ({ setPage, onLogout, visible = true, toggleVisibility, inGrid = false, height = 96 }) => {
  // fallback to global setter if page setter not passed
  const navigate = (pageValue) => {
    if (setPage && typeof setPage === 'function') return setPage(pageValue);
    if (typeof window !== 'undefined' && typeof window.__setAppPage === 'function') return window.__setAppPage(pageValue);
    // noop otherwise
  };

  const containerCommon = `m-0 flex items-center transition-all duration-300 rounded-[60px] overflow-visible`;
  const fixedClass = `fixed top-3 left-1/2 transform -translate-x-1/2 z-50 flex flex-col`;
  const gridOuter = `w-full z-50 flex items-center justify-center`;

  return (
    <>
      <div
        className={`${inGrid ? gridOuter : fixedClass} ${containerCommon} ${visible ? 'translate-y-0 opacity-100' : `${inGrid ? 'opacity-100' : '-translate-y-[200%] opacity-0'}`}`}
        style={inGrid ? { height: `${height}px`, pointerEvents: 'auto' } : undefined}
      >
        {/* inner pill only wraps the buttons (not full-row) */}
        <div
          className="inline-flex items-center p-2 rounded-[40px]"
          style={{
            background: 'rgba(var(--color-sidenav-primary-rgb), 0.8)',
            border: '3px solid var(--color-accent)',
            boxShadow: '0 15px 40px rgba(var(--color-accent-rgb), 0.4)',
            gap: '8px'
          }}
        >
          <button
            onClick={toggleVisibility}
            className="flex rounded-[40px] items-center justify-center h-12 w-12 bg-[rgba(var(--color-tertiary-rgb),0.7)] text-accent shadow-lg hover:bg-[rgba(var(--color-accent-rgb),0.4)] transition-all duration-300 ease-linear cursor-pointer group"
            aria-label="Toggle sidenav"
            title="Toggle"
          >
            <FaChevronDown className={`text-accent transition-transform duration-300 ${visible ? 'rotate-180' : ''}`} size={24} />
          </button>

          <div className="inline-flex items-center">
            <SideNavIcon icon={<AiOutlineUsergroupAdd size="40" />} onClick={() => navigate('start')} />
            <SideNavIcon icon={<GoCommentDiscussion size="33" />} onClick={() => navigate('direct')} />
            <SideNavIcon icon={<CiSettings size="40" />} onClick={() => navigate('settings')} />
            <SideNavIcon icon={<CiLogout size="35" />} onClick={onLogout} extraClasses="hover:bg-red-500 hover:text-white" />
          </div>
        </div>
      </div>

      {/* when not in-grid and hidden, keep the small floating reveal button */}
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

const SideNavIcon = ({ icon, onClick, extraClasses = "" }) => {
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

export default SideNav;