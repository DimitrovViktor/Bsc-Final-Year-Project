import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import moment from 'moment';
import { FaTelegramPlane, FaPaperclip, FaTimesCircle, FaEdit, FaTrash } from "react-icons/fa";

const API_BASE_URL = 'http://localhost:5000';

const DirectMessage = () => {
    const [socket, setSocket] = useState(null);
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editedContent, setEditedContent] = useState('');

    useEffect(() => {
        if (currentUser.user_ID) {
            const newSocket = io(`${API_BASE_URL}/direct`, {
                query: `user_ID=${currentUser.user_ID}`
            });
            setSocket(newSocket);

            return () => newSocket.close();
        }
    }, [currentUser.user_ID]);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/users`)
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => console.error('Failed to fetch users', error));
    }, []);

    useEffect(() => {
    const addMessage = (newMessage) => {
        if (newMessage.sender_ID === currentUser.user_ID && newMessage.receiver_ID === selectedUserId ||
            newMessage.receiver_ID === currentUser.user_ID && newMessage.sender_ID === selectedUserId) {
            const formattedMessage = {
                ...newMessage,
                timestamp: moment(newMessage.message_timestamp).calendar(),
                sender_name: newMessage.sender_name || 'Fetching...'
            };
            setMessages(prevMessages => [...prevMessages, formattedMessage]);
        }
    };

    const updatePrivateMessage = (data) => {
        if ((data.receiver_ID === currentUser.user_ID && data.sender_ID === selectedUserId) ||
            (data.sender_ID === currentUser.user_ID && data.receiver_ID === selectedUserId)) {
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

    const deletePrivateMessage = (data) => {
        if ((data.receiver_ID === currentUser.user_ID && data.sender_ID === selectedUserId) ||
            (data.sender_ID === currentUser.user_ID && data.receiver_ID === selectedUserId)) {
            setMessages(prevMessages => prevMessages.map(msg => 
                msg.message_ID === data.message_ID
                    ? { ...msg, is_deleted: true }
                    : msg
            ));
        }
    };

    if (socket) {
        socket.on('receive_private_message', addMessage);
        socket.on('private_message_updated', updatePrivateMessage);
        socket.on('private_message_deleted', deletePrivateMessage);
    }

    return () => {
        if (socket) {
            socket.off('receive_private_message', addMessage);
            socket.off('private_message_updated', updatePrivateMessage);
            socket.off('private_message_deleted', deletePrivateMessage);
        }
    };
    }, [socket, selectedUserId, currentUser.user_ID]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (selectedUserId && currentUser.user_ID) {
            fetchMessages();
        }
    }, [selectedUserId, currentUser.user_ID]);

    const fetchMessages = async () => {
        const response = await axios.get(`${API_BASE_URL}/private_messages`, {
            params: { user_id: currentUser.user_ID, target_user_id: selectedUserId }
        });
        setMessages(response.data.map(msg => ({
            ...msg,
            timestamp: moment(msg.message_timestamp).calendar(),
            sender_name: msg.sender_name
        })));
    };

    const sendMessage = async () => {
        if (!message.trim() && !file) return;

        const formData = new FormData();
        formData.append('content', message.trim());
        formData.append('sender_user_id', currentUser.user_ID);
        formData.append('receiver_user_id', selectedUserId);

        if (file) {
            formData.append('file', file);
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/send_private_message`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            socket.emit('send_private_message', {
                ...response.data,
                sender_ID: currentUser.user_ID,
                receiver_ID: selectedUserId,
                message_content: response.data.message_content
            });

            setMessage('');
            setFile(null);
        } catch (error) {
            console.error('Sending message failed:', error);
        }
    };

    const handleInputChange = (event) => {
        setMessage(event.target.value);
    };

    const handleFileButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const newFile = event.target.files[0];
        if (newFile) {
            setFile(newFile);
        }
    };

    const handleSelectUser = (userId) => {
        setSelectedUserId(userId);
        setMessages([]);
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
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
            await axios.patch(`${API_BASE_URL}/private_messages/${editingMessageId}`, {
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
                await axios.delete(`${API_BASE_URL}/private_messages/${messageId}`);
            } catch (error) {

                setMessages(prevMessages => prevMessages.map(msg => 
                    msg.message_ID === messageId
                        ? { ...msg, is_deleted: false }
                        : msg
                ));
                console.error('Error deleting message:', error);
            }
        }
    };

    return (
        <div className="relative w-full min-h-screen animate-fade-in">
            <div className="absolute inset-0 z-0">
                <div 
                    className="w-full h-full"
                    style={{
                        backgroundImage: "var(--background-image-url)",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundAttachment: 'fixed',
                        filter: 'brightness(0.5) blur(5px)',
                        transform: 'scale(1.05)',
                    }}
                />
            </div>

            <div className='grid grid-cols-12 gap-4 p-4 relative z-10 h-[calc(100vh)]'>
                <div 
                    className='col-start-1 col-span-3 p-4 flex flex-col text-text shadow-2xl rounded-3xl overflow-hidden animate-slide-up'
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
                            Logged in as [{currentUser.role === 'staff' ? 'Staff' : 'Student'}] {currentUser.name}
                        </h1>
                    </div>
                    
                    <div className='text-center text-xl mt-2 font-bold mb-2'>Direct Messages</div>
                    
                    <div 
                        className='overflow-y-auto rounded-3xl mb-3'
                        style={{ 
                            maxHeight: '80vh',
                            background: 'rgba(var(--color-sidenav-primary-rgb), 0.6)',
                            backdropFilter: 'blur(10px)',
                            border: '2px solid var(--color-accent)'
                        }}
                    >
                        <div className="flex flex-col gap-3 p-2">
                            {users.map((user) => (
                                <button
                                    key={user.user_ID}
                                    onClick={() => handleSelectUser(user.user_ID)}
                                    className={`text-base py-3 px-2 flex items-center justify-center rounded-full transition-all duration-300 ease-out cursor-pointer w-full group
                                        ${selectedUserId === user.user_ID 
                                            ? 'bg-[var(--color-accent)] text-white' 
                                            : 'text-text hover:bg-[var(--color-accent)] hover:text-white'}`}
                                    style={{
                                        background: selectedUserId === user.user_ID 
                                            ? 'var(--color-accent)' 
                                            : 'rgba(var(--color-sidenav-primary-rgb), 0.6)',
                                        color: selectedUserId === user.user_ID 
                                            ? 'white' 
                                            : 'var(--color-text)',
                                        border: '2px solid var(--color-accent)',
                                        transform: 'translateY(0)',
                                    }}
                                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <span className="transition-all duration-300 group-hover:font-bold group-hover:tracking-wide">
                                        {user.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className='col-start-4 col-span-9 flex flex-col gap-3 mr-2 text-text'>
                    <div 
                        className='h-1/8 flex items-center justify-center p-3 rounded-3xl animate-slide-up'
                        style={{
                            background: 'rgba(var(--color-sidenav-primary-rgb), 0.5)',
                            backdropFilter: 'blur(10px)',
                            border: '2px solid var(--color-accent)',
                            animationDelay: "0.2s"
                        }}
                    >
                        <h1 className='text-3xl font-bold truncate'>
                            {selectedUserId 
                                ? users.find(u => u.user_ID === selectedUserId)?.name 
                                : 'Select a user'}
                        </h1>
                    </div>
                    
                    <div 
                        className='h-full rounded-3xl overflow-hidden p-3 flex flex-col animate-slide-up'
                        style={{
                            background: 'rgba(var(--color-sidenav-primary-rgb), 0.5)',
                            backdropFilter: 'blur(10px)',
                            border: '2px solid var(--color-accent)',
                            animationDelay: "0.3s"
                        }}
                    >
                        <div className="messages flex-grow overflow-y-auto overflow-x-hidden rounded-3xl bg-[rgba(var(--color-sidenav-primary-rgb),0.6)] backdrop-blur-sm p-3"
                            style={{ maxHeight: 'calc(100vh - 200px)' }}>
                            {messages.map((msg, index) => {
                                const isCurrentUser = msg.sender_ID === currentUser.user_ID;
                                
                                let messageContent;
                                if (msg.is_deleted) {
                                    messageContent = <div className="text-gray-500 italic">[message deleted]</div>;
                                } else if (msg.message_content.startsWith('file:')) {
                                    const parts = msg.message_content.substring(5).split('|');
  
                                    let fileURL, fileName;
                                    if (parts.length === 2) {
         
                                        fileURL = parts[0];
                                        fileName = parts[1];
                                    } else if (parts.length >= 3) {
                             
                                        fileURL = parts[1];
                                        fileName = parts[2];
                                    } else {
                             
                                        fileURL = parts[0];
                                        fileName = "file";
                                    }
                                    
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
                                } else {
                                    messageContent = msg.message_content;
                                }
                                
                                return (
                                    <div 
                                        key={index} 
                                        className={`message-bubble my-3 p-4 flex flex-col rounded-2xl transition-all duration-300 ${
                                            isCurrentUser 
                                                ? 'bg-[rgba(var(--color-accent-rgb),0.2)] border-l-4 border-[var(--color-accent)] ml-10' 
                                                : 'bg-[rgba(var(--color-tertiary-rgb),0.4)] border-l-4 border-[var(--color-secondary)] mr-10'
                                        } animate-slide-up`}
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <div className="message-header flex justify-between items-center mb-2">
                                            <div className="flex items-center">
                                                <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-bold">
                                                    {msg.sender_ID === currentUser.user_ID ? 'You' : 'User'}
                                                </span>
                                                <span className="ml-2 font-semibold">{msg.sender_name}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-sm text-[var(--color-timestamp)]">
                                                    {msg.timestamp}
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
                                                        className="w-full p-3 rounded-xl bg-[rgba(var(--color-sidenav-primary-rgb),0.7)] text-text border border-accent"
                                                        rows={3}
                                                    />
                                                    <div className="flex mt-2 space-x-2">
                                                        <button 
                                                            onClick={saveEditedMessage}
                                                            className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-blue-600 transition-colors"
                                                        >
                                                            Save
                                                        </button>
                                                        <button 
                                                            onClick={() => setEditingMessageId(null)}
                                                            className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
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
                        
                        <div className="flex mt-auto animate-slide-up" style={{ animationDelay: "0.4s" }}>
                            <div className="flex-1 flex bg-[rgba(var(--color-sidenav-primary-rgb),0.8)] backdrop-blur-sm rounded-2xl border-2 border-accent p-2">
                                <textarea
                                    value={message}
                                    onChange={handleInputChange}
                                    onKeyPress={handleKeyPress}
                                    className="flex-grow p-3 bg-transparent text-input-txt focus:outline-none resize-none"
                                    placeholder="Type a message..."
                                    rows={1}
                                    style={{ minHeight: '50px', maxHeight: '150px' }}
                                />
                                
                                {file && (
                                    <div className="flex items-center ml-2 bg-gradient-to-r from-blue-600 to-accent px-3 py-1 rounded-xl">
                                        {file.type.startsWith('image/') ? (
                                            <img 
                                                src={URL.createObjectURL(file)} 
                                                className="w-10 h-10 object-cover mr-2" 
                                            />
                                        ) : (
                                            <span className="text-sm text-white">{file.name}</span>
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
                                    className="p-2 mx-1 bg-gradient-to-r from-blue-600 to-accent text-white rounded-xl hover:from-blue-700 hover:to-accent-dark transition-all"
                                >
                                    <FaPaperclip size={20} />
                                </button>
                                
                                <button
                                    onClick={sendMessage}
                                    className="p-3 bg-gradient-to-r from-blue-600 to-accent text-white rounded-xl hover:from-blue-700 hover:to-accent-dark transition-all shadow-lg"
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
                    </div>
                </div>
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

export default DirectMessage;