import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import moment from 'moment';
import { FaTelegramPlane, FaPaperclip, FaTimesCircle, FaEdit, FaTrash, FaArrowLeft, FaArrowRight, FaDownload, FaTimes } from "react-icons/fa";

const API_BASE_URL = 'http://localhost:5000';
const socket = io(API_BASE_URL);

const Chat = ({ channelId }) => {
  const [currentUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]); 
  const [gallery, setGallery] = useState({ open: false, images: [], index: 0, size: null });
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const textAreaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetchMessages();

    const handleNewMessage = (msg) => {
      if (msg.channel === channelId) {
        fetchUser(msg.student_ID || msg.staff_ID, !!msg.staff_ID).then(username => {
          const newMessage = {
            ...msg,
            username,
            isStaff: !!msg.staff_ID,
            message_content: msg.content,
            timestamp: msg.timestamp,
            is_deleted: false
          };
          setMessages(prevMessages => [...prevMessages, newMessage]);
        });
      }
    };


    const handleMessageUpdated = (data) => {

      const channelMatch = data.channel_ID === channelId || data.channelId === channelId;
      if (channelMatch) {
        setMessages(prevMessages => prevMessages.map(msg => {
          if (msg.message_ID === data.message_ID) {
            return {
              ...msg,
              message_content: data.new_content,
              is_edited: data.is_edited || false,
              is_deleted: false
            };
          }
          return msg;
        }));
      }
    };


    const handleMessageDeleted = (data) => {
      const channelMatch = data.channel_ID === channelId || data.channelId === channelId;
      if (channelMatch) {
        setMessages(prevMessages => prevMessages.map(msg => {
          if (msg.message_ID === data.message_ID) {
            return {
              ...msg,
              message_content: '[deleted]',
              is_deleted: true
            };
          }
          return msg;
        }));
      }
    };

    socket.on('receive_message', handleNewMessage);
    socket.on('message_updated', handleMessageUpdated);
    socket.on('message_deleted', handleMessageDeleted);
    
    return () => {
      socket.off('receive_message', handleNewMessage);
      socket.off('message_updated', handleMessageUpdated);
      socket.off('message_deleted', handleMessageDeleted);
    };
  }, [channelId]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/channels/${channelId}/messages`);
      const fetchedMessages = response.data || [];
      
      const messagesWithUsernames = await Promise.all(fetchedMessages.map(async (msg) => {
        const isStaff = msg.staff_ID !== null;
        const userId = isStaff ? msg.staff_ID : msg.student_ID;
        const username = await fetchUser(userId, isStaff);
        return {
          ...msg,
          username,
          isStaff,
          timestamp: msg.message_timestamp,
          is_deleted: msg.is_deleted || false
        };
      }));

      setMessages(messagesWithUsernames);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchUser = async (userId, isStaff) => {
    const userTypeEndpoint = isStaff ? 'staff' : 'students';
    try {
      const response = await axios.get(`${API_BASE_URL}/${userTypeEndpoint}/${userId}/info`);
      return response.data.username;
    } catch (error) {
      console.error(`Error fetching ${userTypeEndpoint} info:`, error);
      return 'Unknown';
    }
  };

  const sendMessage = async () => {
    if (!message.trim() && files.length === 0) return;
    let content = message.trim();


    if (files.length > 0) {
      const attachments = [];
      for (const f of files) {
        const formData = new FormData();
        formData.append('file', f.file || f);
        try {
          const uploadResponse = await axios.post(`${API_BASE_URL}/uploads`, formData, {
            headers: {'Content-Type': 'multipart/form-data'}
          });
          const url = uploadResponse.data.filepath;
          const name = (f.name || (f.file && f.file.name)) || 'file';
          const type = (f.file ? f.file.type : (f.type || '')).startsWith('image/') ? 'image' : 'other';
          attachments.push(`file:${type}|${url}|${name}`);
        } catch (err) {
          console.error('File upload failed for', f, err);
        }
      }
      if (attachments.length > 0) {
        if (content) content = `${content}||${attachments.join('::')}`;
        else content = `||${attachments.join('::')}`;
      }
    }

    const messageData = {
      content,
      channel: channelId,
      student_ID: currentUser.role === 'student' ? currentUser.id : null,
      staff_ID: currentUser.role === 'staff' ? currentUser.id : null,
      timestamp: new Date().toISOString()
    };

    socket.emit('send_message', messageData);
    setMessage('');
    setFiles([]);
  };
  
  const autoResizeTextArea = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
    }
  };

  const handleInputChange = (event) => {
    setMessage(event.target.value);
    autoResizeTextArea();
  };


  const handleFileChange = (event) => {
    const selected = Array.from(event.target.files || []);
    if (!selected.length) return;

    setFiles(prev => {
      const combined = [...prev];
      for (const file of selected) {

        const exists = combined.some(cf => (cf.file && cf.file.name === file.name && cf.file.size === file.size) || (cf.name === file.name && cf.type === file.type && !cf.file));
        if (!exists) {
          if (file.type.startsWith('image/')) {
            combined.push({ file, preview: URL.createObjectURL(file), name: file.name, type: file.type });
          } else {
            combined.push({ file, name: file.name, type: file.type });
          }
        }
      }
      return combined;
    });


    event.target.value = '';
  };


  useEffect(() => {
    return () => {
      files.forEach(f => {
        if (f.preview) {
          try { URL.revokeObjectURL(f.preview); } catch (e) {}
        }
      });
    };
  }, [files]);


  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && gallery.open) closeGallery();
      if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && gallery.open) {
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gallery.open]);

  const openGallery = async (images, startIndex=0) => {
    try {
      const results = await Promise.all(images.map(img => new Promise(resolve => {
        const i = new Image();
        i.src = img.url;
        i.onload = () => resolve({ w: i.naturalWidth, h: i.naturalHeight });
        i.onerror = () => resolve({ w: 800, h: 600 });
      })));
      const maxW = Math.max(...results.map(r => r.w), 300);
      const maxH = Math.max(...results.map(r => r.h), 200);

      const vw = window.innerWidth * 0.65;
      const vh = window.innerHeight * 0.65;
      const scale = Math.min(vw / maxW, vh / maxH, 1);
      const displayW = Math.round(maxW * scale);
      const displayH = Math.round(maxH * scale);
      setGallery({ open: true, images, index: startIndex, size: { width: displayW, height: displayH } });
    } catch (e) {
      setGallery({ open: true, images, index: startIndex, size: null });
    }
  };
  const closeGallery = () => setGallery({ open: false, images: [], index: 0, size: null });
  const nextImage = () => setGallery(g => ({ ...g, index: (g.index + 1) % g.images.length }));
  const prevImage = () => setGallery(g => ({ ...g, index: (g.index - 1 + g.images.length) % g.images.length }));

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      if (event.shiftKey) {
      } else {
        event.preventDefault();
        sendMessage();
      }
    }
  };

  const handleEditMessage = (messageId, currentContent) => {
    setEditingMessageId(messageId);
    setEditedContent(currentContent);
  };

  const saveEditedMessage = async () => {
    if (!editedContent.trim()) return;

    socket.emit('edit_message', {
      message_ID: editingMessageId,
      new_content: editedContent,
      channelId: channelId
    });
    setEditingMessageId(null);
    setEditedContent('');
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {

      socket.emit('delete_message', {
        message_ID: messageId,
        channelId: channelId
      });
    }
  };


  const parseAttachments = (content) => {
    if (!content) return { text: '', attachments: [] };
    const parts = content.split('||');
    const text = parts[0] || '';
    const attachments = [];
    if (parts[1]) {
      const items = parts[1].split('::');
      for (const it of items) {
        if (!it.startsWith('file:')) continue;
        const rem = it.substring(5);
        const segs = rem.split('|');
        attachments.push({ type: segs[0] || 'other', url: segs[1] || '', name: segs[2] || '' });
      }
    }
    return { text, attachments };
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="messages flex-grow overflow-y-auto overflow-x-hidden rounded-3xl backdrop-blur-sm p-3 mb-4 glow-effect" style={{ background: 'rgba(var(--color-sidenav-primary-rgb), 0.6)', boxShadow: '0 0 20px rgba(var(--color-accent-rgb), 0.4)', maxHeight: 'calc(80vh)' }}>
        {messages.map((msg, index) => {
          const parsed = parseAttachments(msg.message_content || '');
          const textPart = parsed.text;
          const attachments = parsed.attachments;
          const imageAttachments = attachments.filter(a => a.type === 'image');
          const fileAttachments = attachments.filter(a => a.type !== 'image');

          const isCurrentUser = (currentUser.role === 'student' && msg.student_ID === currentUser.id) || (currentUser.role === 'staff' && msg.staff_ID === currentUser.id);

          let messageContent;
          if (msg.is_deleted) {
            messageContent = <div className="text-gray-500 italic">[message deleted]</div>;
          } else {
            messageContent = (
              <div>
                { textPart && <div className="mb-2 break-words">{textPart}</div> }
                { imageAttachments.length > 0 && (
                  <div className="image-grid grid gap-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {imageAttachments.slice(0,6).map((img, i) => {
                      const showOverlay = imageAttachments.length > 6 && i === 0;
                      return (
                        <div key={i} className="relative cursor-pointer" onClick={() => openGallery(imageAttachments, i)}>
                          <img src={img.url} alt={img.name} className={`object-cover w-full h-28 rounded-xl ${showOverlay ? 'opacity-50' : ''}`} />
                          {showOverlay && <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold">+{imageAttachments.length - 6}</div>}
                        </div>
                      );
                    })}
                  </div>
                )}
                { fileAttachments.length > 0 && (
                  <div className="files-list mt-2 space-y-1">
                    {fileAttachments.map((f, idx) => (
                      <div key={idx} className="p-2 border rounded-xl bg-[rgba(0,0,0,0.03)]">
                        <a href={f.url} download={f.name} target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--file-border-color)]">
                          {f.name}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={index} className={`message-bubble my-3 p-4 flex flex-col rounded-2xl transition-all duration-300 glow-effect animate-slide-up ${isCurrentUser ? 'bg-[rgba(var(--color-accent-rgb),0.2)] border-l-4 border-[var(--color-accent)] ml-10' : 'bg-[rgba(var(--color-tertiary-rgb),0.4)] border-l-4 border-[var(--color-secondary)] mr-10'}`} style={{ boxShadow: '0 0 10px rgba(var(--color-accent-rgb), 0.2)', animationDelay: `${index * 0.05}s` }}>
              {}
              <div className="message-header flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${msg.isStaff ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>{msg.isStaff ? 'Staff ★' : 'Student'}</span>
                  <span className="ml-2 font-semibold">{msg.username}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-[var(--color-timestamp)]">
                    {moment(msg.timestamp).calendar()}
                  </span>
                  {!!msg.is_edited && (<span className="text-xs text-gray-500 ml-2">(edited)</span>)}
                </div>
              </div>

              <div className="message-content break-words">
                {editingMessageId === msg.message_ID ? (
                  <div>
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full p-3 rounded-xl bg-[rgba(var(--color-sidenav-primary-rgb),0.7)] text-text border border-accent glow-effect"
                      rows={3}
                      style={{
                        boxShadow: '0 0 10px rgba(var(--color-accent-rgb), 0.3)'
                      }}
                    />
                    <div className="flex mt-2 space-x-2">
                      <button 
                        onClick={saveEditedMessage}
                        className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-blue-600 transition-colors glow-effect"
                        style={{
                          boxShadow: '0 0 10px rgba(var(--color-accent-rgb), 0.3)'
                        }}
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => setEditingMessageId(null)}
                        className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors glow-effect"
                        style={{
                          boxShadow: '0 0 10px rgba(var(--color-accent-rgb), 0.2)'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  messageContent
                )}
              </div>
              
              {isCurrentUser && !msg.is_deleted && editingMessageId !== msg.message_ID && (
                <div className="flex justify-end mt-2 space-x-2">
                  <button 
                    onClick={() => handleEditMessage(msg.message_ID, msg.message_content)}
                    className="p-1 text-[var(--color-accent)] hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <FaEdit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteMessage(msg.message_ID)}
                    className="p-1 text-[var(--color-accent)] hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      {}
      <div className="flex mt-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <div className="flex-1 flex rounded-2xl border-2 border-accent p-2 backdrop-blur-sm glow-effect" style={{ background: 'rgba(var(--color-sidenav-primary-rgb), 0.7)', boxShadow: '0 0 15px rgba(var(--color-accent-rgb), 0.3)' }}>
          <textarea
            ref={textAreaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="flex-grow p-3 bg-transparent text-input-txt focus:outline-none resize-none"
            placeholder="Type a message..."
            rows={1}
            style={{ minHeight: '50px', maxHeight: '150px' }}
          />
          
          {files.length > 0 && (
            <div className="ml-3 flex-shrink-0">
              <div className="grid gap-1" style={{ width: 110, gridTemplateColumns: 'repeat(3, 1fr)', gridAutoRows: '34px' }}>
                {files.slice(0,6).map((f, idx) => {
                  const isImage = f.type && f.type.startsWith && f.type.startsWith('image/');
                  const overlayMore = files.length > 6 && idx === 0;
                  return (
                    <div key={idx} className="relative rounded-md overflow-hidden cursor-pointer" onClick={() => {
                      const images = files.filter(x => x.type && x.type.startsWith && x.type.startsWith('image/')).map(x => ({ url: x.preview || x.url, name: x.name }));
                      if (images.length) openGallery(images, Math.max(0, images.findIndex(i => i.name === (f.name || (f.file && f.file.name)))));
                    }}>
                      {isImage ? (
                        <img src={f.preview || (f.url)} alt={f.name} className={`w-full h-full object-cover ${overlayMore ? 'opacity-50' : ''}`} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs bg-[rgba(0,0,0,0.06)]">
                          {f.name.length > 12 ? f.name.slice(0,10) + '…' : f.name}
                        </div>
                      )}
                      {overlayMore && <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold bg-black/30">+{files.length - 6}</div>}
                      <button onClick={(e) => { e.stopPropagation(); setFiles(prev => prev.filter((_,i) => i !== idx)); }} className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 text-red-500 border" title="Remove">
                        <FaTimesCircle />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button onClick={() => fileInputRef.current.click()} className="p-2 mx-1 bg-gradient-to-r from-blue-600 to-accent text-white rounded-xl hover:from-blue-700 hover:to-accent-dark transition-all glow-effect" style={{ boxShadow: '0 0 10px rgba(var(--color-accent-rgb), 0.3)' }}>
            <FaPaperclip size={20} />
          </button>

          <button onClick={sendMessage} className="p-3 bg-gradient-to-r from-blue-600 to-accent text-white rounded-xl hover:from-blue-700 hover:to-accent-dark transition-all shadow-lg glow-effect" style={{ boxShadow: '0 0 15px rgba(var(--color-accent-rgb), 0.5)' }}>
            <FaTelegramPlane size={24} />
          </button>
        </div>

        <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" multiple />
      </div>

      {}
      {gallery.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={closeGallery}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div onClick={e => e.stopPropagation()} className="relative w-full max-w-4xl mx-4 rounded-3xl p-4" style={{ background: 'rgba(var(--color-sidenav-primary-rgb),0.95)', border: '2px solid var(--color-accent)', boxShadow: '0 10px 40px rgba(0,0,0,0.6)' }}>
            
            {}
            <button onClick={closeGallery} aria-label="Close preview" className="absolute top-3 right-3 p-2 rounded-full bg-[rgba(var(--color-sidenav-primary-rgb),0.6)] border-2 border-[var(--color-accent)] text-white">
              <FaTimes />
            </button>

            {}
            <div className="absolute left-1/2 top-4 transform -translate-x-1/2 flex items-center gap-3 z-10">
              <button onClick={(e) => { e.stopPropagation(); prevImage(); }} aria-label="Previous" className="w-10 h-10 flex items-center justify-center rounded-full bg-[rgba(var(--color-sidenav-primary-rgb),0.6)] border-2 border-[var(--color-accent)] text-white">
                <FaArrowLeft />
              </button>

              <button onClick={(e) => {
                e.stopPropagation();
                const img = gallery.images[gallery.index];
                const a = document.createElement('a');
                a.href = img.url;
                a.download = img.name || 'image';
                document.body.appendChild(a);
                a.click();
                a.remove();
              }} aria-label="Download" className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-accent)] text-white border-2 border-[var(--color-accent)]">
                <FaDownload />
              </button>

              <button onClick={(e) => { e.stopPropagation(); nextImage(); }} aria-label="Next" className="w-10 h-10 flex items-center justify-center rounded-full bg-[rgba(var(--color-sidenav-primary-rgb),0.6)] border-2 border-[var(--color-accent)] text-white">
                <FaArrowRight />
              </button>
            </div>

            {}
            <div className="w-full flex items-center justify-center py-8">
              <div style={{
                width: gallery.size ? `${gallery.size.width}px` : '100%',
                height: gallery.size ? `${gallery.size.height}px` : 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img src={gallery.images[gallery.index].url} alt={gallery.images[gallery.index].name} className="max-h-full max-w-full object-contain rounded-xl" />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              {gallery.images.map((_, i) => (
                <div key={i} onClick={() => setGallery(g => ({ ...g, index: i }))} className={`w-2 h-2 rounded-full ${i === gallery.index ? 'bg-[var(--color-accent)]' : 'bg-gray-300'}`} />
              ))}
            </div>
          </div>
        </div>
      )}

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

export default Chat;