import React, { useState, useEffect, useCallback } from 'react';
import { FaGear, FaTrash } from "react-icons/fa6";

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
    }
  };

  // Get themes from localStorage or initialize with defaults
  const [themes, setThemes] = useState(() => {
    const savedThemes = localStorage.getItem('themes');
    return savedThemes ? JSON.parse(savedThemes) : defaultThemes;
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
      [newThemeName]: {...themes[currentTheme]}
    };
    
    setThemes(newThemes);
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
  ];

  return (
    <div className="theme-settings">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4 text-text">Theme Settings</h3>
        
        {/* Theme Selection */}
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-2 text-text">Select Theme</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.keys(themes).map(themeName => (
              <div 
                key={themeName}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all relative ${
                  currentTheme === themeName 
                    ? 'border-accent shadow-lg glow-effect' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                onClick={() => applyTheme(themeName)}
              >
                {/* Edit button for custom themes */}
                {themeName !== 'light' && themeName !== 'dark' && (
                  <button 
                    className="absolute top-1 right-1 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
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
                    className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center"
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

        {/* Theme Creation */}
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-2 text-text">Create New Theme</h4>
          <div className="flex items-center">
            <input
              type="text"
              value={newThemeName}
              onChange={(e) => setNewThemeName(e.target.value)}
              placeholder="Theme name"
              className="flex-grow p-2 border rounded-lg mr-2 bg-tertiary text-text"
            />
            <button
              onClick={createNewTheme}
              className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </div>

        {/* Theme Editing */}
        {editingTheme && themes[editingTheme] && (
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-2 text-text">
              Editing: <span className="font-bold capitalize">{editingTheme}</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-2">
              {themeVariables.map(variable => (
                <div key={variable.id} className="flex items-center">
                  <label className="w-1/2 text-sm mr-2 text-text">{variable.name}</label>
                  <div className="flex w-1/2">
                    <input
                      type="color"
                      value={themes[editingTheme][variable.id]}
                      onChange={(e) => updateThemeVariable(variable.id, e.target.value)}
                      className="w-8 h-8 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={themes[editingTheme][variable.id]}
                      onChange={(e) => updateThemeVariable(variable.id, e.target.value)}
                      className="ml-2 px-2 py-1 border rounded w-full text-sm bg-tertiary text-text"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex mt-4">
              <button
                onClick={() => applyTheme(editingTheme)}
                className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-blue-700 mr-2"
              >
                Apply Theme
              </button>
              <button
                onClick={() => setEditingTheme(null)}
                className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 text-text"
              >
                Close Editor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThemeSettings;