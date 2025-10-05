
export function ensureThemesInStorage() {
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
      '--background-image-url': "url('https://images.unsplash.com/photo-1613487214774-fee150ccda12?q=80&w=2070&auto=format&fit=crop')",
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
      '--background-image-url': "url('https://images.unsplash.com/photo-1429892494097-cccc61109f58?q=80&w=2070&auto=format&fit=crop')",
    }
  };

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
  }

  let themes;
  try { themes = JSON.parse(localStorage.getItem('themes')); } catch { themes = null; }
  if (!themes) { themes = defaultThemes; }


  Object.keys(defaultThemes).forEach(k => {
    if (!themes[k]) themes[k] = defaultThemes[k];
    if (!themes[k]['--background-image-url']) themes[k]['--background-image-url'] = defaultThemes[k]['--background-image-url'];
  });


  for (const tName of Object.keys(themes)) {
    const theme = themes[tName];
    Object.entries(theme).forEach(([prop, val]) => {
      if (typeof val === 'string' && val.startsWith('#')) {
        const rgb = hexToRgb(val);
        if (rgb) theme[`${prop}-rgb`] = rgb;
      }
    });
  }

  localStorage.setItem('themes', JSON.stringify(themes));
  if (!localStorage.getItem('currentTheme')) localStorage.setItem('currentTheme', 'dark');
  return themes;
}

export function applyThemeFromStorage() {
  try {
    const themes = ensureThemesInStorage();
    const current = localStorage.getItem('currentTheme') || 'dark';
    const theme = themes[current] || themes.dark || Object.values(themes)[0];
    Object.entries(theme).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });

    window.dispatchEvent(new CustomEvent('themeChanged'));
  } catch (e) {
    console.warn('Failed applying theme', e);
  }
}
