import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';

const NotificationsContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_OR_UPDATE': {
      const existing = state.items.find(n => n.channel === action.payload.channel);
      let items;
      if (existing) {
        items = state.items.map(n => n.channel === action.payload.channel ? {
          ...n,
          preview: action.payload.preview,
          message_ID: action.payload.message_ID,
          timestamp: action.payload.timestamp,
          from: action.payload.from,
          avatar: action.payload.avatar || n.avatar,
          unreadCount: n.unreadCount + 1
        } : n);
      } else {
        items = [...state.items, { ...action.payload, unreadCount: 1 }];
      }
      return { ...state, items };
    }
    case 'CLEAR_CHANNEL':
      return { ...state, items: state.items.filter(n => n.channel !== action.channel) };
    case 'MARK_READ':
      return { ...state, items: state.items.map(n => n.channel === action.channel ? { ...n, unreadCount: 0 } : n) };
    case 'DISMISS':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.id) };
    case 'PUSH_TOAST':
      return { ...state, toasts: [...state.toasts, action.toast].slice(-3) };
    case 'AUTO_DISMISS':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.id) };
    case 'HYDRATE':
      return { ...state, items: action.items || [], muted: action.muted || false };
    case 'SET_MUTED':
      return { ...state, muted: action.muted };
    default:
      return state;
  }
}

export function NotificationsProvider({ children }) {
  const firstLoad = useRef(true);
  const [state, dispatch] = useReducer(reducer, { items: [], toasts: [], muted: false });
  const dndRef = useRef(false); 


  useEffect(() => {
    try {
      const raw = localStorage.getItem('notifications_state');
      if (raw) {
        const parsed = JSON.parse(raw);
        dispatch({ type: 'HYDRATE', items: parsed.items || [], muted: !!parsed.muted });
      }
    } catch {}
  }, []);


  useEffect(() => {
    if (firstLoad.current) { firstLoad.current = false; return; }
    try {
      const toPersist = { items: state.items.map(i => ({ ...i })), muted: state.muted };
      localStorage.setItem('notifications_state', JSON.stringify(toPersist));
    } catch {}
  }, [state.items, state.muted]);

  const pushToast = useCallback((toast) => {
    if (state.muted) return; 
    const id = toast.id || `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    dispatch({ type: 'PUSH_TOAST', toast: { ...toast, id } });
    setTimeout(() => dispatch({ type: 'AUTO_DISMISS', id }), toast.sticky ? 15000 : 6000);
  }, [state.muted]);

  const addNotification = useCallback((n, showToast = true) => {
    dispatch({ type: 'ADD_OR_UPDATE', payload: n });
    if (showToast && !state.muted) {
      pushToast({
        channel: n.channel,
        id: `toast_${n.channel}_${n.message_ID}`,
        preview: n.preview,
        from: n.from,
        avatar: n.avatar,
        message_ID: n.message_ID,
        timestamp: n.timestamp
      });
    }
  }, [pushToast, state.muted]);

  const clearChannel = useCallback(channel => dispatch({ type: 'CLEAR_CHANNEL', channel }), []);
  const markRead = useCallback(channel => dispatch({ type: 'MARK_READ', channel }), []);
  const dismissToast = useCallback(id => dispatch({ type: 'DISMISS', id }), []);

  const setMuted = useCallback((muted, { reason } = {}) => {
    dispatch({ type: 'SET_MUTED', muted });
    if (reason === 'dnd') dndRef.current = muted; 
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'user') {
        try {
          const u = JSON.parse(e.newValue || '{}');
          if (u.status === 'dnd' && !dndRef.current) {
            setMuted(true, { reason: 'dnd' });
          } else if (u.status !== 'dnd' && dndRef.current) {

            setMuted(false, { reason: 'dnd' });
          }
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [setMuted]);

  return (
    <NotificationsContext.Provider value={{ ...state, addNotification, clearChannel, markRead, dismissToast, setMuted }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext); 
}

export function NotificationToasts({ onSelect }) {
  const { toasts, dismissToast } = useNotifications();
  return (
  <div className="fixed bottom-4 right-4 space-y-3 z-[9998] max-w-sm w-72 text-text">
      {toasts.map(t => (
  <div key={t.id} className="p-3 rounded-xl shadow-lg text-sm cursor-pointer backdrop-blur-sm border flex gap-3 items-start text-text"
             style={{ background: 'rgba(var(--color-sidenav-primary-rgb),0.85)', borderColor: 'var(--color-accent)' }}
             onClick={() => { onSelect && onSelect(t.channel, t.message_ID); dismissToast(t.id); }}>
          <img src={t.avatar || 'https://via.placeholder.com/40?text=U'} alt="av" className="w-10 h-10 object-cover rounded-full border" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{t.from}</div>
            <div className="text-xs opacity-80 line-clamp-2 break-words">{t.preview}</div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); dismissToast(t.id); }} className="text-xs opacity-60 hover:opacity-100">✕</button>
        </div>
      ))}
    </div>
  );
}

export function NotificationsPanel({ onSelect }) {
  const { items, clearChannel, markRead } = useNotifications();
  if (!items.length) return <div className="p-4 text-sm opacity-70 text-text">No notifications</div>;
  return (
    <div className="max-h-96 overflow-y-auto space-y-2">
      {items.slice().sort((a,b)=> new Date(b.timestamp)-new Date(a.timestamp)).map(n => (
  <div key={n.channel} className="p-3 rounded-xl border cursor-pointer group text-text"
             style={{ background: 'rgba(var(--color-sidenav-primary-rgb),0.6)', borderColor: 'var(--color-accent)' }}
             onClick={() => { onSelect && onSelect(n.channel, n.message_ID); markRead(n.channel); }}>
          <div className="flex items-center gap-3">
            <img src={n.avatar || 'https://via.placeholder.com/40?text=U'} className="w-10 h-10 rounded-full object-cover border" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold truncate">{n.from}</span>
                {n.unreadCount > 0 && <span className="text-xs bg-[var(--color-accent)] text-white px-2 py-0.5 rounded-full">{n.unreadCount}</span>}
              </div>
              <div className="text-xs opacity-80 truncate">{n.preview}</div>
              <div className="text-[10px] opacity-50 mt-0.5">{new Date(n.timestamp).toLocaleTimeString()}</div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); clearChannel(n.channel); }} className="text-xs opacity-40 hover:opacity-100">✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}
