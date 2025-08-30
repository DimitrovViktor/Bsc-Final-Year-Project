import React, { useState, useEffect, useCallback } from 'react';
import { FaGear, FaTrash } from "react-icons/fa6";

// Helper function to convert hex to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
};

const ThemeSettings = () => {
  // Default theme definitions
  const defaultThemes = {
    light: {
      '--color-text': '#333',
      '--color-background': '#f0f0f0',
      '--color-background-secondary': '#d0d0d0',
      '--color-sidenav-primary': '#ffffff',
      '--color-sidenav-secondary': '#e0e0e0',
      '--color-primary': '#ffffff',
      '--color-secondary': '#433bff',
      '--color-tertiary': '#e0e0e0',
      '--color-accent': '#433bff',
      '--color-input-txt': '#2c3033',
      '--color-info-txt': '#343a40',
      '--file-border-color': '#433bff',
      '--color-timestamp': '#949ca6',
      '--button-sec': '#9a96fd',
      '--background-image-url': "url('https://images.unsplash.com/photo-1613487214774-fee150ccda12?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
    },
    dark: {
      '--color-text': '#e4eaeb',
      '--color-background': '#2b303b',
      '--color-background-secondary': '#1c1f26',
      '--color-sidenav-primary': '#111317',
      '--color-sidenav-secondary': '#141f38',
      '--color-primary': '#16181d',
      '--color-secondary': '#1e5680',
      '--color-tertiary': '#292e38',
      '--color-accent': '#4bb5f5',
      '--color-input-txt': '#a0a1b2',
      '--color-info-txt': '#b7b9cc',
      '--file-border-color': '#4bb5f5',
      '--color-timestamp': '#949ca6',
      '--button-sec': '#378fd1',
      '--background-image-url': "url('https://images.unsplash.com/photo-1429892494097-cccc61109f58?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
    }
  };

  // Add RGB versions for acrylic effect
  const addRgbVersions = (themes) => {
    const newThemes = { ...themes };
    for (const themeName in newThemes) {
      const theme = newThemes[themeName];
      const rgbTheme = { ...theme };
      for (const key in theme) {
        if (theme[key].startsWith('#') && key !== '--background-image-url') {
          const rgb = hexToRgb(theme[key]);
          if (rgb) {
            rgbTheme[`${key}-rgb`] = rgb;
          }
        }
      }
      newThemes[themeName] = rgbTheme;
    }
    return newThemes;
  };

  // Get themes from localStorage or initialize with defaults
  const [themes, setThemes] = useState(() => {
    const savedThemes = localStorage.getItem('themes');
    const initialThemes = savedThemes ? JSON.parse(savedThemes) : defaultThemes;
    
    // Ensure all themes have background image URL
    Object.keys(initialThemes).forEach(themeName => {
      if (!initialThemes[themeName]['--background-image-url']) {
        initialThemes[themeName]['--background-image-url'] = defaultThemes.dark['--background-image-url'];
      }
    });
    
    return addRgbVersions(initialThemes);
  });

  // Current theme name
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('currentTheme') || 'dark';
  });

  // Theme being edited
  const [editingTheme, setEditingTheme] = useState(null);
  
  // New theme name
  const [newThemeName, setNewThemeName] = useState('');

  // Apply theme to document
  const applyTheme = useCallback((themeName) => {
    const theme = themes[themeName];
    if (!theme) return;
    
    // Apply each variable to root element
    Object.entries(theme).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });
    
    // Update state and storage
    setCurrentTheme(themeName);
    localStorage.setItem('currentTheme', themeName);
    
    // Force re-render of all components
    const event = new CustomEvent('themeChanged');
    window.dispatchEvent(event);
  }, [themes]);

  // Initialize theme on component mount
  useEffect(() => {
    applyTheme(currentTheme);
  }, [applyTheme, currentTheme]);

  // Save themes to localStorage when they change
  useEffect(() => {
    localStorage.setItem('themes', JSON.stringify(themes));
  }, [themes]);

  // Create a new theme
  const createNewTheme = () => {
    if (!newThemeName.trim()) return;
    
    const newThemes = {
      ...themes,
      [newThemeName]: { 
        ...themes[currentTheme],
        // Copy background image from current theme
        '--background-image-url': themes[currentTheme]['--background-image-url'] 
      }
    };
    
    const updatedThemes = addRgbVersions(newThemes);
    setThemes(updatedThemes);
    setNewThemeName('');
    setEditingTheme(newThemeName);
    applyTheme(newThemeName);
  };

  // Update a theme variable
  const updateThemeVariable = (variable, value) => {
    const updatedThemes = {
      ...themes,
      [editingTheme]: {
        ...themes[editingTheme],
        [variable]: value
      }
    };
    
    // Update RGB version if needed
    if (value.startsWith('#') && variable !== '--background-image-url') {
      const rgb = hexToRgb(value);
      if (rgb) {
        updatedThemes[editingTheme][`${variable}-rgb`] = rgb;
      }
    }
    
    setThemes(updatedThemes);
    
    // Update immediately
    document.documentElement.style.setProperty(variable, value);
  };

  // Delete a custom theme
  const deleteTheme = (themeName) => {
    if (themeName === 'light' || themeName === 'dark') return;
    
    const newThemes = {...themes};
    delete newThemes[themeName];
    setThemes(newThemes);
    
    if (currentTheme === themeName) {
      applyTheme('dark');
    }
  };

  // Theme variables for editing
  const themeVariables = [
    { id: '--color-text', name: 'Text Color' },
    { id: '--color-background', name: 'Background' },
    { id: '--color-background-secondary', name: 'Secondary Background' },
    { id: '--color-sidenav-primary', name: 'SideNav Primary' },
    { id: '--color-sidenav-secondary', name: 'SideNav Secondary' },
    { id: '--color-primary', name: 'Primary Color' },
    { id: '--color-secondary', name: 'Secondary Color' },
    { id: '--color-tertiary', name: 'Tertiary Color' },
    { id: '--color-accent', name: 'Accent Color' },
    { id: '--color-input-txt', name: 'Input Text' },
    { id: '--color-info-txt', name: 'Info Text' },
    { id: '--file-border-color', name: 'File Border' },
    { id: '--color-timestamp', name: 'Timestamp Color' },
    { id: '--button-sec', name: 'Button Secondary' },
    { id: '--background-image-url', name: 'Background Image URL' },
  ];

  return (
    <div className="theme-settings">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-6 text-center bg-gradient-to-r from-[var(--color-accent)] to-blue-400 text-transparent bg-clip-text">
          Theme Settings
        </h3>
        
        <div className="mb-8 animate-slide-up">
          <h4 className="text-lg font-medium mb-4 text-text">Select Theme</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.keys(themes).map(themeName => (
              <div 
                key={themeName}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 relative ${
                  currentTheme === themeName 
                    ? 'border-accent shadow-lg glow-effect' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                onClick={() => applyTheme(themeName)}
                style={{
                  background: `rgba(${themes[themeName]['--color-sidenav-primary-rgb']}, 0.7)`,
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s cubic-bezier(0.22, 0.61, 0.36, 1)'
                }}
              >
                {themeName !== 'light' && themeName !== 'dark' && (
                  <button 
                    className="absolute top-2 right-2 text-gray-300 hover:text-white transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTheme(themeName);
                    }}
                  >
                    <FaGear />
                  </button>
                )}
                
                <div className="font-medium mb-2 capitalize text-text">{themeName} Theme</div>
                <div className="flex space-x-1">
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: themes[themeName]['--color-background'] }}></div>
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: themes[themeName]['--color-accent'] }}></div>
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: themes[themeName]['--color-primary'] }}></div>
                </div>
                {themeName !== 'light' && themeName !== 'dark' && (
                  <button 
                    className="mt-2 text-xs text-red-400 hover:text-red-300 flex items-center transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTheme(themeName);
                    }}
                  >
                    <FaTrash className="mr-1" /> Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h4 className="text-lg font-medium mb-3 text-text">Create New Theme</h4>
          <div className="flex items-center">
            <input
              type="text"
              value={newThemeName}
              onChange={(e) => setNewThemeName(e.target.value)}
              placeholder="Theme name"
              className="flex-grow p-3 border-2 border-[var(--color-accent)] rounded-2xl mr-3 bg-[rgba(var(--color-sidenav-primary-rgb),0.6)] text-text placeholder:text-[var(--color-info-txt)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:shadow-[0_0_15px_var(--color-accent)] transition-all duration-500"
              style={{ 
                textShadow: '0 0 5px rgba(75, 181, 245, 0.7)',
                transition: 'all 0.5s cubic-bezier(0.22, 0.61, 0.36, 1)'
              }}
            />
            <button
              onClick={createNewTheme}
              className="bg-[rgba(var(--color-sidenav-primary-rgb),0.6)] text-text font-bold py-3 px-6 rounded-2xl border-2 border-[var(--color-accent)] shadow-lg transition-all duration-500 hover:bg-gradient-to-r hover:from-[var(--color-accent)] hover:to-blue-500 hover:shadow-[0_0_15px_var(--color-accent)] hover:text-white group"
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
              <span className="group-hover:drop-shadow-[0_0_8px_rgba(75,181,245,1)] transition-all duration-500">
                Create
              </span>
            </button>
          </div>
        </div>

        {editingTheme && themes[editingTheme] && (
          <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h4 className="text-lg font-medium mb-3 text-text">
              Editing: <span className="font-bold capitalize text-[var(--color-accent)]">{editingTheme}</span>
            </h4>
            
            <div 
              className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-3 rounded-xl"
              style={{
                background: `rgba(${themes[editingTheme]['--color-sidenav-primary-rgb']}, 0.6)`,
                backdropFilter: 'blur(10px)'
              }}
            >
              {themeVariables.map(variable => (
                <div key={variable.id} className="flex items-center">
                  <label className="w-1/2 mr-3 text-text">{variable.name}</label>
                  <div className="flex w-1/2">
                    {variable.id !== '--background-image-url' ? (
                      <>
                        <input
                          type="color"
                          value={themes[editingTheme][variable.id].startsWith('url(') 
                            ? '#000000' 
                            : themes[editingTheme][variable.id]}
                          onChange={(e) => updateThemeVariable(variable.id, e.target.value)}
                          className="w-8 h-8 cursor-pointer mr-2"
                        />
                        <input
                          type="text"
                          value={themes[editingTheme][variable.id]}
                          onChange={(e) => updateThemeVariable(variable.id, e.target.value)}
                          className="px-3 py-2 border-2 border-[var(--color-accent)] rounded-2xl w-full text-sm bg-[rgba(var(--color-sidenav-primary-rgb),0.6)] text-text focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:shadow-[0_0_10px_var(--color-accent)] transition-all duration-300"
                        />
                      </>
                    ) : (
                      <input
                        type="text"
                        value={themes[editingTheme][variable.id].replace(/^url\(['"]?|['"]?\)$/g, '')}
                        onChange={(e) => updateThemeVariable(variable.id, `url('${e.target.value}')`)}
                        placeholder="Enter image URL"
                        className="px-3 py-2 border-2 border-[var(--color-accent)] rounded-2xl w-full text-sm bg-[rgba(var(--color-sidenav-primary-rgb),0.6)] text-text focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:shadow-[0_0_10px_var(--color-accent)] transition-all duration-300"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex mt-6 space-x-3">
              <button
                onClick={() => applyTheme(editingTheme)}
                className="flex-1 bg-[rgba(var(--color-sidenav-primary-rgb),0.6)] text-text font-bold py-3 px-4 rounded-2xl border-2 border-[var(--color-accent)] shadow-lg transition-all duration-500 hover:bg-gradient-to-r hover:from-[var(--color-accent)] hover:to-blue-500 hover:shadow-[0_0_15px_var(--color-accent)] hover:text-white group"
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
                <span className="group-hover:drop-shadow-[0_0_8px_rgba(75,181,245,1)] transition-all duration-500">
                  Apply Theme
                </span>
              </button>
              <button
                onClick={() => setEditingTheme(null)}
                className="flex-1 bg-[rgba(var(--color-sidenav-primary-rgb),0.6)] text-text font-bold py-3 px-4 rounded-2xl border-2 border-gray-500 shadow-lg transition-all duration-500 hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-700 hover:shadow-[0_0_10px_rgba(100,100,100,0.5)] hover:text-white group"
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
                <span className="group-hover:drop-shadow-[0_0_8px_rgba(200,200,200,0.8)] transition-all duration-500">
                  Close Editor
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
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
        
        .glow-effect {
          box-shadow: 0 0 15px var(--color-accent);
        }
      `}</style>
    </div>
  );
};

export default ThemeSettings;