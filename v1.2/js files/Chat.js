import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import moment from 'moment';
import { FaTelegramPlane, FaPaperclip, FaTimesCircle, FaEdit, FaTrash } from "react-icons/fa";

const API_BASE_URL = 'http://localhost:5000';
const socket = io(API_BASE_URL);

const Chat = ({ channelId }) => {
  const [currentUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
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
      if (data.channel_ID === channelId) {
        setMessages(prevMessages => prevMessages.map(msg => 
          msg.message_ID === data.message_ID 
            ? { 
                ...msg, 
                message_content: data.new_content, 
                is_edited: data.is_edited 
              } 
            : msg
        ));
      }
    };

    const handleMessageDeleted = (data) => {
      if (data.channel_ID === channelId) {
        setMessages(prevMessages => prevMessages.map(msg => 
          msg.message_ID === data.message_ID
            ? { ...msg, is_deleted: true }
            : msg
        ));
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
    if (message.trim() || file) {
      let content = message.trim();
      if (file) {
        const formData = new FormData();
        formData.append('file', file.file);
        const uploadResponse = await axios.post(`${API_BASE_URL}/uploads`, formData, {
          headers: {'Content-Type': 'multipart/form-data'}
        });
        content = `file:${uploadResponse.data.filepath}|${file.file.name}`;  
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
      setFile(null);
    }
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
    const file = event.target.files[0];
    if (!file) return;
  
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFile({
          file,
          preview: e.target.result,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    } else {
      setFile({
        file,
        name: file.name
      });
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

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
    
    setMessages(prevMessages => prevMessages.map(msg => 
      msg.message_ID === editingMessageId 
        ? { ...msg, message_content: editedContent, is_edited: true } 
        : msg
    ));
    
    setEditingMessageId(null);
    setEditedContent('');
    
    try {
      await axios.patch(`${API_BASE_URL}/messages/${editingMessageId}`, {
        content: editedContent
      });
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      setMessages(prevMessages => prevMessages.map(msg => 
        msg.message_ID === messageId
          ? { ...msg, is_deleted: true }
          : msg
      ));
      
      try {
        await axios.delete(`${API_BASE_URL}/messages/${messageId}`);
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div 
        className="messages flex-grow overflow-y-auto overflow-x-hidden rounded-3xl backdrop-blur-sm p-3 mb-4 glow-effect"
        style={{
          background: 'rgba(var(--color-sidenav-primary-rgb), 0.6)',
          boxShadow: '0 0 20px rgba(var(--color-accent-rgb), 0.4)',
          maxHeight: 'calc(80vh)'
        }}
      >
        {messages.map((msg, index) => {
          let messageContent;
          if (!msg.is_deleted && msg.message_content.startsWith('file:')) {
            const parts = msg.message_content.substring(5).split('|');
            const fileURL = parts[0];
            const fileName = parts[1];
            if (/\.(jpg|jpeg|png|gif)$/i.test(fileName)) {
              messageContent = (
                <div className="mt-2">
                  <img 
                    src={fileURL} 
                    alt={fileName} 
                    className="max-w-xs max-h-48 border-2 border-[var(--file-border-color)] rounded-xl"
                  />
                </div>
              );
            } else {
              messageContent = (
                <div className="mt-2 p-3 border-2 border-[var(--file-border-color)] rounded-xl">
                  <a 
                    href={fileURL} 
                    download={fileName} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[var(--file-border-color)] hover:underline"
                  >
                    {fileName}
                  </a>
                  <div className="text-sm text-[var(--color-info-txt)] mt-1">
                    Click file name to download.
                  </div>
                </div>
              );
            }
          } else if (!msg.is_deleted && msg.message_content.startsWith('<img')) {
            messageContent = <div dangerouslySetInnerHTML={{ __html: msg.message_content }} />;
          } else if (msg.is_deleted) {
            messageContent = <div className="text-gray-500 italic">[message deleted]</div>;
          } else {
            messageContent = msg.message_content || 'No message content';
          }

          const isCurrentUser = (currentUser.role === 'student' && msg.student_ID === currentUser.id) || 
                              (currentUser.role === 'staff' && msg.staff_ID === currentUser.id);

          return (
            <div 
              key={index} 
              className={`message-bubble my-3 p-4 flex flex-col rounded-2xl transition-all duration-300 glow-effect animate-slide-up ${
                isCurrentUser 
                  ? 'bg-[rgba(var(--color-accent-rgb),0.2)] border-l-4 border-[var(--color-accent)] ml-10' 
                  : 'bg-[rgba(var(--color-tertiary-rgb),0.4)] border-l-4 border-[var(--color-secondary)] mr-10'
              }`}
              style={{
                boxShadow: '0 0 10px rgba(var(--color-accent-rgb), 0.2)',
                animationDelay: `${index * 0.05}s`
              }}
            >
              <div className="message-header flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    msg.isStaff 
                      ? 'bg-red-500 text-white' 
                      : 'bg-blue-500 text-white'
                  }`}>
                    {msg.isStaff ? 'Staff ★' : 'Student'}
                  </span>
                  <span className="ml-2 font-semibold">{msg.username}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-[var(--color-timestamp)]">
                    {moment(msg.timestamp).calendar()}
                  </span>
                  {!!msg.is_edited && (
                    <span className="text-xs text-gray-500 ml-2">(edited)</span>
                  )}
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
      
      <div className="flex mt-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <div 
          className="flex-1 flex rounded-2xl border-2 border-accent p-2 backdrop-blur-sm glow-effect"
          style={{
            background: 'rgba(var(--color-sidenav-primary-rgb), 0.7)',
            boxShadow: '0 0 15px rgba(var(--color-accent-rgb), 0.3)'
          }}
        >
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
          
          {file && (
            <div className="flex items-center ml-2 bg-gradient-to-r from-blue-600 to-accent px-3 py-1 rounded-xl glow-effect">
              {file.preview ? (
                <img 
                  src={file.preview} 
                  alt={file.name} 
                  className="w-10 h-10 object-cover mr-2" 
                />
              ) : (
                <span className="text-sm text-white ml-2">{file.name}</span>
              )}
              <button 
                onClick={() => setFile(null)} 
                className="ml-2 text-white hover:text-red-200"
              >
                <FaTimesCircle size={20} />
              </button>
            </div>
          )}
          
          <button
            onClick={handleFileButtonClick}
            className="p-2 mx-1 bg-gradient-to-r from-blue-600 to-accent text-white rounded-xl hover:from-blue-700 hover:to-accent-dark transition-all glow-effect"
            style={{
              boxShadow: '0 0 10px rgba(var(--color-accent-rgb), 0.3)'
            }}
          >
            <FaPaperclip size={20} />
          </button>
          
          <button
            onClick={sendMessage}
            className="p-3 bg-gradient-to-r from-blue-600 to-accent text-white rounded-xl hover:from-blue-700 hover:to-accent-dark transition-all shadow-lg glow-effect"
            style={{
              boxShadow: '0 0 15px rgba(var(--color-accent-rgb), 0.5)'
            }}
          >
            <FaTelegramPlane size={24} />
          </button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />
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
      `}</style>
    </div>
  );
};

export default Chat;