import React, { useState } from 'react';

import axios from 'axios';

import BackgroundImage from './BackgroundImage';



const AuthPage = ({ onLoginSuccess }) => {

  const [username, setUsername] = useState('');

  const [password, setPassword] = useState('');

  const [loginType, setLoginType] = useState('student');



  const handleUsernameChange = (e) => setUsername(e.target.value);

  const handlePasswordChange = (e) => setPassword(e.target.value);



  const handleSubmit = async (e) => {

    e.preventDefault();

    const loginEndpoint = loginType === 'student' ? '/login/student' : '/login/staff';



    try {

      const response = await axios.post(`http://localhost:5000${loginEndpoint}`, {

        username,

        password,

      });

      if (response.data.success) {

        localStorage.setItem('user', JSON.stringify({

          user_ID: response.data.user_ID,

          id: response.data.id,

          name: response.data.name,

          program_ID: response.data.program_ID,

          role: response.data.role

        }));

        onLoginSuccess();

      } else {

        alert(response.data.message);

      }

    } catch (error) {

      console.error('Login error:', error);

      alert('Login failed: ' + error.response?.data?.message || error.message);

    }

  };



  const toggleLoginType = () => setLoginType(prevType => prevType === 'student' ? 'staff' : 'student');



  return (

    <BackgroundImage ignoreTheme={true}>

      <div className="relative z-10 w-full">

        <form 

          onSubmit={handleSubmit} 

          className="rounded-3xl px-8 pt-6 pb-8 mb-4 border-2 border-[var(--color-accent)] backdrop-blur-sm animate-fade-in"

          style={{

            background: `rgba(var(--color-sidenav-primary-rgb), 0.7)`

          }}

        >

          <div className="mb-6 text-center">

            <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--color-accent)] to-blue-400 text-transparent bg-clip-text">

              GroupTech

            </h1>

            <p className="text-[var(--color-info-txt)] mt-2 animate-pulse-slow">Collaborative Learning Platform</p>

          </div>

          

          <div className="mb-4 animate-slide-up">

            <label 

              htmlFor="username" 

              className="block text-[var(--color-text)] text-lg font-bold mb-2"

            >

              Username:

            </label>

            <input

              type="text"

              id="username"

              value={username}

              placeholder="Username"

              onChange={handleUsernameChange}

              className="w-full py-2 px-4 bg-[rgba(var(--color-sidenav-primary-rgb),0.6)] text-[var(--color-accent)] rounded-2xl border-2 border-[var(--color-accent)] shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:shadow-[0_0_15px_var(--color-accent)] transition-all duration-500 placeholder:text-[var(--color-info-txt)]"

              style={{ 

                textShadow: '0 0 5px rgba(75, 181, 245, 0.7)',

                transition: 'all 0.5s cubic-bezier(0.22, 0.61, 0.36, 1)'

              }}

              required

            />

          </div>

          

          <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>

            <label 

              htmlFor="password" 

              className="block text-[var(--color-text)] text-lg font-bold mb-2"

            >

              Password:

            </label>

            <input

              type="password"

              id="password"

              value={password}

              placeholder="Password"

              onChange={handlePasswordChange}

              className="w-full py-2 px-4 bg-[rgba(var(--color-sidenav-primary-rgb),0.6)] text-[var(--color-accent)] rounded-2xl border-2 border-[var(--color-accent)] shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:shadow-[0_0_15px_var(--color-accent)] transition-all duration-500 placeholder:text-[var(--color-info-txt)]"

              style={{ 

                textShadow: '0 0 5px rgba(75, 181, 245, 0.7)',

                transition: 'all 0.5s cubic-bezier(0.22, 0.61, 0.36, 1)'

              }}

              required

            />

          </div>

          

          <div className="flex flex-col space-y-4">

            <button

              type="submit"

              className="w-full bg-[rgba(var(--color-sidenav-primary-rgb),0.6)] text-[var(--color-text)] font-bold py-3 px-4 rounded-2xl shadow-lg transition-all duration-500 hover:bg-gradient-to-r hover:from-[var(--color-accent)] hover:to-blue-500 hover:shadow-[0_0_15px_var(--color-accent)] hover:text-white group"

              style={{ 

                transition: 'all 0.5s cubic-bezier(0.22, 0.61, 0.36, 1)',

                transform: 'translateY(0)',

                willChange: 'transform, box-shadow, background, color'

              }}

              onMouseEnter={(e) => {

                e.currentTarget.style.transform = 'translateY(-2px)';

                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.3)';

              }}

              onMouseLeave={(e) => {

                e.currentTarget.style.transform = 'translateY(0)';

                e.currentTarget.style.boxShadow = '';

              }}

            >

              <span 

                className="group-hover:drop-shadow-[0_0_8px_rgba(75,181,245,1)] transition-all duration-500"

                style={{ transition: 'text-shadow 0.5s cubic-bezier(0.22, 0.61, 0.36, 1)' }}

              >

                Log in as {loginType}

              </span>

            </button>

            

            <button

              type="button"

              onClick={toggleLoginType}

              className="w-full bg-[rgba(var(--color-sidenav-primary-rgb),0.6)] text-[var(--color-text)] font-bold py-3 px-4 rounded-2xl shadow-lg transition-all duration-500 hover:bg-gradient-to-r hover:from-[var(--color-accent)] hover:to-blue-500 hover:shadow-[0_0_15px_var(--color-accent)] hover:text-white group"

              style={{ 

                transition: 'all 0.5s cubic-bezier(0.22, 0.61, 0.36, 1)',

                transform: 'translateY(0)',

                willChange: 'transform, box-shadow, background, color'

              }}

              onMouseEnter={(e) => {

                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <span 
                className="group-hover:drop-shadow-[0_0_8px_rgba(75,181,245,1)] transition-all duration-500"
                style={{ transition: 'text-shadow 0.5s cubic-bezier(0.22, 0.61, 0.36, 1)' }}
              >
                Switch to {loginType === 'student' ? 'staff' : 'student'}
              </span>
            </button>
          </div>
        </form>
      </div>
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse-slow {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
          opacity: 0;
        }
      `}</style>
    </BackgroundImage>
  );
};

export default AuthPage;