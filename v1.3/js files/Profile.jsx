import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaCamera } from 'react-icons/fa';
import { useNotifications } from './NotificationsContext';

const API_BASE_URL = 'http://localhost:5000';
const statusOptions = [
  { value: 'online', label: 'Online', color: 'bg-green-500' },
  { value: 'away', label: 'Away', color: 'bg-yellow-500' },
  { value: 'dnd', label: 'Do Not Disturb', color: 'bg-red-500' },
  { value: 'invisible', label: 'Invisible', color: 'bg-gray-400' },
  { value: 'offline', label: 'Offline', color: 'bg-gray-500' }
];

export default function Profile({ user, onUpdateLocalUser }) {
  const notifications = useNotifications();
  const priorManualMute = useRef(null);
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('offline');

  useEffect(() => {
    if (user?.user_ID) {
      axios.get(`${API_BASE_URL}/users/${user.user_ID}/profile`).then(res => {
        setProfile(res.data);
        setSelectedStatus(res.data.status || 'offline');
      }).catch(() => {});
    }
  }, [user?.user_ID]);

  const updateStatus = async (value) => {
    setSelectedStatus(value);
    try {
      await axios.patch(`${API_BASE_URL}/users/${user.user_ID}/profile`, { status: value }, {
        headers: { 'X-User-ID': user.user_ID }
      });
      window?.socket?.emit && window.socket.emit('set_status', { user_ID: user.user_ID, status: value });
      setProfile(p => ({ ...(p||{}), status: value }));
      if (onUpdateLocalUser) onUpdateLocalUser({ ...user, status: value });
      if (notifications) {
        if (value === 'dnd') {
          priorManualMute.current = notifications.muted;
          notifications.setMuted(true, { reason: 'dnd' });
        } else if (selectedStatus === 'dnd') {
          if (priorManualMute.current !== null) {
            notifications.setMuted(!!priorManualMute.current, { reason: 'dnd' });
            priorManualMute.current = null;
          } else {
            notifications.setMuted(false, { reason: 'dnd' });
          }
        }
      }
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
  const resp = await axios.post(`${API_BASE_URL}/users/${user.user_ID}/profile/image`, formData, { headers: { 'Content-Type': 'multipart/form-data', 'X-User-ID': user.user_ID } });
      const image = resp.data.profile_image;
      setProfile(p => ({ ...(p||{}), profile_image: image }));
      if (onUpdateLocalUser) onUpdateLocalUser({ ...user, profile_image: image });
      const stored = JSON.parse(localStorage.getItem('user')||'{}');
      stored.profile_image = image;
      localStorage.setItem('user', JSON.stringify(stored));
    } catch (e) {
      console.error('Image upload failed', e);
    } finally {
      setUploading(false);
    }
  };

  if (!profile) return <div className="text-text text-sm">Loading profile...</div>;

  const currentStatusObj = statusOptions.find(s => s.value === selectedStatus) || statusOptions[0];

  return (
    <div className="space-y-6">
      <div className="relative w-32 h-32 mx-auto">
        <img
          src={profile.profile_image || 'https://via.placeholder.com/150?text=Avatar'}
          alt="avatar"
          className="w-32 h-32 object-cover rounded-full border-4 border-[var(--color-accent)] shadow-lg"/>
        <label className="absolute bottom-2 right-2 bg-[var(--color-accent)] text-white p-2 rounded-full cursor-pointer shadow-md hover:scale-105 transition-transform" title="Change avatar">
          <FaCamera />
          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </label>
        {uploading && <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs rounded-full">Uploading...</div>}
        <div className={`absolute top-2 left-2 w-4 h-4 rounded-full ring-2 ring-white ${currentStatusObj.color}`} title={currentStatusObj.label}></div>
      </div>

      <div className="text-center">
  <div className="text-lg font-bold text-text">{profile.student_name || profile.staff_name || 'User'}</div>
  <div className="text-xs opacity-70 text-text/70">Role: {profile.role}</div>
      </div>

      <div>
  <label className="block text-xs font-bold mb-1 text-text/80">Status</label>
        <select
          value={selectedStatus}
          onChange={(e) => updateStatus(e.target.value)}
          className="w-full p-2 rounded-xl bg-[rgba(var(--color-sidenav-primary-rgb),0.6)] border-2 border-[var(--color-accent)] text-text focus:outline-none"
        >
          {statusOptions.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
