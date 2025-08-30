import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import Chat from './Chat';
import Algorithm from './Algorithm';
import SideNav from './SideNav';
import BackgroundImage from './BackgroundImage';

const SIDENAV_HEIGHT = 96;

const StartPage = () => {
  const [user, setUser] = useState({});
  const [program, setProgram] = useState(null);
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [channels, setChannels] = useState([]);
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sideNavVisible, setSideNavVisible] = useState(true);

  const API_BASE_URL = 'http://localhost:5000';

  const ApiService = {
    getPrograms: () => axios.get(`${API_BASE_URL}/programs`),
    getModulesByProgramId: (programId) => axios.get(`${API_BASE_URL}/programs/${programId}/modules`).then(response => response.data),
    getChannelsByModuleId: (moduleId, userId, userRole) => axios.get(`${API_BASE_URL}/modules/${moduleId}/channels`, { params: { user_id: userId, user_role: userRole } }),
    getAllUsers: () => axios.get(`${API_BASE_URL}/users`).then(response => response.data),
  };

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    setUser(loggedInUser);
    if (loggedInUser?.program_ID) {
      ApiService.getPrograms().then(response => {
        const userProgram = response.data.find(p => p.program_ID === loggedInUser.program_ID);
        setProgram(userProgram);
      }).catch(error => console.error('Failed to fetch programs', error));
      ApiService.getModulesByProgramId(loggedInUser.program_ID)
        .then(data => {
          setModules(data);
        })
        .catch(error => console.error('Error fetching modules:', error));
    }
  }, []);

  useEffect(() => {
    if (selectedModuleId && user.id && user.role) {
      ApiService.getChannelsByModuleId(selectedModuleId, user.id, user.role)
        .then(response => {
          setChannels(response.data || []);  
        })
        .catch(error => {
          console.error('Error fetching channels:', error);
          setChannels([]);
        });
    }
  }, [selectedModuleId, user.id, user.role]); 

  const handleModuleClick = moduleId => {
    setSelectedModuleId(moduleId);
    setSelectedChannelId(null);
  };

  const handleChannelSelection = e => {
    setSelectedChannelId(e.target.value);
  };

  const renderChannelsDropdown = () => (
    <select 
      onChange={handleChannelSelection} 
      value={selectedChannelId || ''} 
      className='p-2 rounded-2xl w-full border-2 border-[var(--color-accent)] text-center text-base bg-[rgba(var(--color-sidenav-primary-rgb),0.6)] text-text placeholder:text-[var(--color-info-txt)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:shadow-[0_0_10px_var(--color-accent)] transition-all duration-300'
    >
      <option value="" >Select a Channel</option>
      {channels.map(channel => (
        <option key={channel.channel_ID} value={channel.channel_ID}>
          {channel.channel_name}
        </option>
      ))}
    </select>
  );

  return (

    <div className="relative w-full h-screen animate-fade-in overflow-hidden">
      {}
      <button
        onClick={() => setSidebarOpen(s => !s)}
        className="absolute z-20 left-6 p-2 rounded-full bg-[rgba(var(--color-sidenav-primary-rgb),0.8)] border-2 border-[var(--color-accent)] text-white"
        aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        style={{ top: `calc(${SIDENAV_HEIGHT}px + 12px)` }}
      >
        {sidebarOpen ? <FaArrowLeft /> : <FaArrowRight />}
      </button>

      {}
      <BackgroundImage>
        <div className='grid grid-rows-[96px_1fr] grid-cols-12 gap-4 relative z-10 h-screen w-full overflow-hidden'>
          {}
          <div className="row-start-1 row-span-1 col-start-1 col-span-12">
            <SideNav onLogout={() => { localStorage.clear(); window.location.reload(); }} visible={sideNavVisible} toggleVisibility={() => setSideNavVisible(v => !v)} inGrid={true} height={SIDENAV_HEIGHT} />
          </div>

          {}
          <div
            className="row-start-2 row-span-1 col-start-1 col-span-12 grid grid-cols-12 gap-4 h-full w-full overflow-hidden min-h-0"
            style={{ paddingLeft: '1%', paddingRight: '1%', paddingBottom: '1%' }}
          >
            {}
            <div className={`${sidebarOpen ? 'col-start-1 col-span-3' : 'hidden'} p-4 flex flex-col text-text shadow-2xl rounded-3xl overflow-hidden animate-slide-up h-full min-h-0`}
              style={{
                background: 'rgba(var(--color-sidenav-primary-rgb), 0.5)',
                backdropFilter: 'blur(10px)',
                border: '2px solid var(--color-accent)',
                animationDelay: "0.1s"
              }}
            >
              <div 
                className="text-lg font-bold text-text shadow-lg rounded-3xl px-6 pt-4 pb-6 mb-4"
                style={{
                  background: 'rgba(var(--color-sidenav-primary-rgb), 0.5)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid var(--color-accent)'
                }}
              > 
                <h1 className='text-base'>
                  Logged in as [{user.role === 'staff' ? 'Staff' : 'Student'}] {user.name}
                </h1>
                {program && <h2 className='mt-1 text-sm'>Program: {program.program_name}</h2>}
              </div>
              
              <div className='text-center text-xl mt-2 font-bold mb-2'>Modules</div>
              
              <div 
                className='overflow-y-auto rounded-3xl mb-3 flex-grow min-h-0'
                style={{ 
                  maxHeight: 'none',
                  background: 'rgba(var(--color-sidenav-primary-rgb), 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid var(--color-accent)'
                }}
              >
                <div className="flex flex-col gap-3 p-2">
                  {modules.map((module, index) => (
                    <button
                      key={module.module_ID}
                      onClick={() => handleModuleClick(module.module_ID)}
                      className={`text-base py-3 px-2 flex items-center justify-center rounded-full transition-all duration-300 ease-out cursor-pointer w-full group
                        ${module.module_ID === selectedModuleId 
                          ? 'bg-[var(--color-accent)] text-white' 
                          : 'text-text hover:bg-[var(--color-accent)] hover:text-white'}`}
                      style={{
                        background: module.module_ID === selectedModuleId 
                          ? 'var(--color-accent)' 
                          : 'rgba(var(--color-sidenav-primary-rgb), 0.6)',
                        color: module.module_ID === selectedModuleId 
                          ? 'white' 
                          : 'var(--color-text)',
                        border: '2px solid var(--color-accent)',
                        transform: 'translateY(0)',
                        animationDelay: `${index * 0.05}s`
                      }}
                      onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <span className="transition-all duration-300 group-hover:font-bold group-hover:tracking-wide">
                        {module.module_name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              
              {selectedModuleId && (
                  renderChannelsDropdown()
              )}
              
              {selectedModuleId && user.role !== 'staff' && <Algorithm moduleId={selectedModuleId} studentId={user.id}/>}
            </div>

            {}
            <div className={`${sidebarOpen ? 'col-start-4 col-span-9' : 'col-start-1 col-span-12'} flex flex-col gap-3 mr-2 text-text h-full min-h-0`}>
				<div 
					className='flex items-center justify-center p-3 rounded-3xl animate-slide-up'
					style={{
						background: 'rgba(var(--color-sidenav-primary-rgb), 0.5)',
						backdropFilter: 'blur(10px)',
						border: '2px solid var(--color-accent)',
						animationDelay: "0.2s"
					}}
				>
					<h1 className='text-3xl font-bold truncate'>
					  {selectedChannelId ? 
						channels.find(ch => ch.channel_ID.toString() === selectedChannelId)?.channel_name : 
						'Select a channel'}
					</h1>
				</div>
				
				<div className='rounded-3xl overflow-hidden p-3 flex flex-col animate-slide-up flex-grow min-h-0'
					style={{
						background: 'rgba(var(--color-sidenav-primary-rgb), 0.5)',
						backdropFilter: 'blur(10px)',
						border: '2px solid var(--color-accent)',
						animationDelay: "0.3s"
					}}
				>
					{selectedChannelId ? (

						<div className="flex-1 min-h-0 overflow-auto">
							<Chat channelId={selectedChannelId} />
						</div>
					) : (
						<div className='text-center text-xl font-bold flex-grow flex items-center justify-center min-h-0'>
							Select a module and a channel to view chat
						</div>
					)}
				</div>
			</div>
          </div>
        </div>
      </BackgroundImage>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default StartPage;