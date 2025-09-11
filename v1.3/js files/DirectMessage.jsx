import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import moment from 'moment';
import { FaTelegramPlane, FaPaperclip, FaTimesCircle, FaEdit, FaTrash, FaArrowLeft, FaArrowRight, FaDownload, FaTimes } from "react-icons/fa";
import SideNav from './SideNav';
import BackgroundImage from './BackgroundImage';

const API_BASE_URL = 'http://localhost:5000';
const SIDENAV_HEIGHT = 96;

const DirectMessage = () => {
	const [socket, setSocket] = useState(null);
	const [users, setUsers] = useState([]);
	const [selectedUserId, setSelectedUserId] = useState(null);
	const [currentUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
	const [messages, setMessages] = useState([]);
	const [message, setMessage] = useState('');

	const [files, setFiles] = useState([]);
	const fileInputRef = useRef(null);
	const messagesEndRef = useRef(null);
	const [editingMessageId, setEditingMessageId] = useState(null);
	const [editedContent, setEditedContent] = useState('');

	const [gallery, setGallery] = useState({ open: false, images: [], index: 0, size: null });


	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [sideNavVisible, setSideNavVisible] = useState(true);


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
			.then(response => setUsers(response.data))
			.catch(err => console.error('Failed to fetch users', err));
	}, []);


	const fetchMessages = useCallback(async () => {
		if (!selectedUserId || !currentUser.user_ID) return;
		try {
			const response = await axios.get(`${API_BASE_URL}/private_messages`, {
				params: { user_id: currentUser.user_ID, target_user_id: selectedUserId }
			});
			setMessages(response.data.map(msg => ({
				...msg,
				timestamp: moment(msg.message_timestamp).calendar(),
				sender_name: msg.sender_name
			})));
		} catch (e) {
			console.error('Failed to fetch private messages', e);
		}
	}, [selectedUserId, currentUser.user_ID]);


	useEffect(() => {
		if (!socket) return;
		const addMessage = (newMessage) => {
			const senderId = newMessage.sender_ID ?? newMessage.sender_user_id;
			const receiverId = newMessage.receiver_ID ?? newMessage.receiver_user_id;
			if (
				(senderId === currentUser.user_ID && receiverId === selectedUserId) ||
				(receiverId === currentUser.user_ID && senderId === selectedUserId)
			) {
				const formatted = {
					...newMessage,
					sender_ID: senderId,
					receiver_ID: receiverId,
					timestamp: moment(newMessage.message_timestamp).calendar(),
					sender_name: newMessage.sender_name || 'Fetching...'
				};
				setMessages(prev => {
					if (prev.some(m => m.message_ID === formatted.message_ID)) return prev;
					return [...prev, formatted];
				});
			}
		};

		const updatePrivateMessage = (data) => {
			setMessages(prev => {
				let found = false;
				const updated = prev.map(m => {
					if (m.message_ID === data.message_ID) {
						found = true;
						return { ...m, message_content: data.new_content, is_edited: data.is_edited };
					}
					return m;
				});
				if (!found) fetchMessages();
				return updated;
			});
		};

		const deletePrivateMessage = (data) => {
			setMessages(prev => {
				let found = false;
				const updated = prev.map(m => {
					if (m.message_ID === data.message_ID) {
						found = true;
						return { ...m, is_deleted: true, message_content: '[deleted]' };
					}
					return m;
				});
				if (!found) fetchMessages();
				return updated;
			});
		};

		socket.on('receive_private_message', addMessage);
		socket.on('private_message_updated', updatePrivateMessage);
		socket.on('private_message_deleted', deletePrivateMessage);

		return () => {
			socket.off('receive_private_message', addMessage);
			socket.off('private_message_updated', updatePrivateMessage);
			socket.off('private_message_deleted', deletePrivateMessage);
		};
	}, [socket, selectedUserId, currentUser.user_ID, fetchMessages]);


	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	useEffect(() => {
		fetchMessages();
	}, [fetchMessages]);


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


	const handleFileChange = (e) => {
		const selected = Array.from(e.target.files || []);
		if (!selected.length) return;
		setFiles(prev => {
			const combined = [...prev];
			for (const f of selected) {
				const exists = combined.some(cf => cf.file && cf.file.name === f.name && cf.file.size === f.size);
				if (!exists) {
					if (f.type && f.type.startsWith('image/')) {
						const preview = URL.createObjectURL(f);
						combined.push({ file: f, preview, name: f.name, type: f.type });
					} else {
						combined.push({ file: f, name: f.name, type: f.type });
					}
				}
			}
			return combined;
		});
		e.target.value = '';
	};

	useEffect(() => {
		return () => {
			files.forEach(f => {
				if (f.preview) {
					try { URL.revokeObjectURL(f.preview); } catch (err) {}
				}
			});
		};

	}, []);

	const handleFileButtonClick = () => fileInputRef.current?.click();

	const removeFileAt = (idx) => {
		setFiles(prev => {
			const copy = [...prev];
			const [removed] = copy.splice(idx, 1);
			if (removed && removed.preview) {
				try { URL.revokeObjectURL(removed.preview); } catch (e) {}
			}
			return copy;
		});
	};


	const sendMessage = async () => {
		const text = message.trim();
		if (!text && files.length === 0) return;

		const formData = new FormData();
		formData.append('content', text);
		formData.append('sender_user_id', currentUser.user_ID);
		formData.append('receiver_user_id', selectedUserId);
		for (const f of files) {
			formData.append('file', f.file || f);
		}

		try {
			const resp = await axios.post(`${API_BASE_URL}/send_private_message`, formData, {
				headers: { 'Content-Type': 'multipart/form-data' }
			});
			socket?.emit('send_private_message', {
				...resp.data,
				sender_ID: currentUser.user_ID,
				receiver_ID: selectedUserId,
				message_content: resp.data.message_content
			});

			files.forEach(f => { if (f.preview) try { URL.revokeObjectURL(f.preview); } catch {} });
			setFiles([]);
			setMessage('');
		} catch (err) {
			console.error('Sending message failed:', err);
		}
	};


	const handleEditMessage = (messageId, currentContent) => {
		setEditingMessageId(messageId);
		setEditedContent(currentContent);
	};
	const saveEditedMessage = async () => {
		if (!editedContent.trim()) return;
		const id = editingMessageId;
		setEditingMessageId(null);
		setEditedContent('');
		try {
			await axios.patch(`${API_BASE_URL}/private_messages/${id}`, { content: editedContent });
		} catch (err) { console.error('Error updating message:', err); }
	};
	const handleDeleteMessage = async (messageId) => {
		if (!window.confirm('Are you sure you want to delete this message?')) return;
		try {
			await axios.delete(`${API_BASE_URL}/private_messages/${messageId}`);
		} catch (err) { console.error('Error deleting message:', err); }
	};


	const openGallery = async (images, startIndex = 0) => {

		try {
			const results = await Promise.all(images.map(img => new Promise(resolve => {
				const i = new Image();
				i.src = img.url;
				i.onload = () => resolve({ w: i.naturalWidth, h: i.naturalHeight });
				i.onerror = () => resolve({ w: 800, h: 600 });
			})));
			const maxW = Math.max(...results.map(r => r.w), 300);
			const maxH = Math.max(...results.map(r => r.h), 200);
			const vw = window.innerWidth * 0.85;
			const vh = window.innerHeight * 0.8;
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

	useEffect(() => {
		const onKey = (e) => {
			if (!gallery.open) return;
			if (e.key === 'Escape') closeGallery();
			if (e.key === 'ArrowRight') nextImage();
			if (e.key === 'ArrowLeft') prevImage();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [gallery.open]);

	return (
		<BackgroundImage>
		<div className="relative w-full h-screen animate-fade-in overflow-hidden">
			{}
			{}

			{}
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
						style={{ background: 'rgba(var(--color-sidenav-primary-rgb), 0.5)', backdropFilter: 'blur(10px)', border: '2px solid var(--color-accent)', animationDelay: "0.1s" }}>
						{}

						<div className='text-center text-xl mt-2 font-bold mb-2'>Direct Messages</div>

						{}
						<div className='flex flex-col flex-grow overflow-y-auto rounded-3xl mb-3 min-h-0' style={{ background: 'rgba(var(--color-sidenav-primary-rgb), 0.6)', backdropFilter: 'blur(10px)', border: '2px solid var(--color-accent)' }}>
							<div className="flex flex-col gap-3 p-2">
								{users.map(user => (
									<button key={user.user_ID} onClick={() => { setSelectedUserId(user.user_ID); setMessages([]); }}
										className={`text-base py-3 px-2 flex items-center justify-center rounded-full transition-all duration-300 ease-out cursor-pointer w-full group ${selectedUserId === user.user_ID ? 'bg-[var(--color-accent)] text-white' : 'text-text hover:bg-[var(--color-accent)] hover:text-white'}`}
										style={{ background: selectedUserId === user.user_ID ? 'var(--color-accent)' : 'rgba(var(--color-sidenav-primary-rgb), 0.6)', color: selectedUserId === user.user_ID ? 'white' : 'var(--color-text)', border: '2px solid var(--color-accent)' }}>
										<span className="transition-all duration-300 group-hover:font-bold group-hover:tracking-wide">{user.name}</span>
									</button>
								))}
							</div>
						</div>
					</div>

					{}
					<div className={`${sidebarOpen ? 'col-start-4 col-span-9' : 'col-start-1 col-span-12'} flex flex-col gap-3 mr-2 text-text h-full min-h-0`}>
						<div className='flex items-center justify-center p-3 rounded-3xl animate-slide-up relative' style={{ background: 'rgba(var(--color-sidenav-primary-rgb), 0.5)', backdropFilter: 'blur(10px)', border: '2px solid var(--color-accent)', animationDelay: "0.2s" }}>
							<button
								onClick={() => setSidebarOpen(s => !s)}
								className="left-6 p-2 rounded-full bg-[rgba(var(--color-sidenav-primary-rgb),0.8)] border-2 border-[var(--color-accent)] text-white absolute"
								aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
							>
								{sidebarOpen ? <FaArrowLeft /> : <FaArrowRight />}
							</button>
							<h1 className='text-3xl font-bold truncate'>
								{selectedUserId ? (users.find(u => u.user_ID === selectedUserId)?.name) : 'Select a user'}
							</h1>
						</div>

						<div className='rounded-3xl overflow-hidden p-3 flex flex-col animate-slide-up flex-grow min-h-0' style={{ background: 'rgba(var(--color-sidenav-primary-rgb), 0.5)', backdropFilter: 'blur(10px)', border: '2px solid var(--color-accent)', animationDelay: "0.3s" }}>
							{}
							<div className="messages flex-grow overflow-y-auto overflow-x-hidden rounded-3xl bg-[rgba(var(--color-sidenav-primary-rgb),0.6)] backdrop-blur-sm p-3 min-h-0" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
								{messages.map((msg, idx) => {
									const isCurrentUser = msg.sender_ID === currentUser.user_ID;
									const parsed = parseAttachments(msg.message_content || '');
									const textPart = parsed.text;
									const attachments = parsed.attachments;
									const imageAttachments = attachments.filter(a => a.type === 'image');
									const fileAttachments = attachments.filter(a => a.type !== 'image');

									return (
										<div key={idx} className={`message-bubble my-3 p-4 flex flex-col rounded-2xl transition-all duration-300 ${isCurrentUser ? 'bg-[rgba(var(--color-accent-rgb),0.2)] border-l-4 border-[var(--color-accent)] ml-10' : 'bg-[rgba(var(--color-tertiary-rgb),0.4)] border-l-4 border-[var(--color-secondary)] mr-10' } animate-slide-up`} style={{ animationDelay: `${idx * 0.05}s` }}>
											<div className="message-header flex justify-between items-center mb-2">
												<div className="flex items-center">
													<span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-bold">
														{msg.sender_ID === currentUser.user_ID ? 'You' : 'User'}
													</span>
													<span className="ml-2 font-semibold">{msg.sender_name}</span>
												</div>
												<div className="flex items-center">
													<span className="text-sm text-[var(--color-timestamp)]">{msg.timestamp}</span>
													{!!msg.is_edited && <span className="text-xs text-gray-500 ml-2">(edited)</span>}
												</div>
											</div>

											<div className="message-content break-words">
												{editingMessageId === msg.message_ID ? (
													<div>
														<textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="w-full p-3 rounded-xl bg-[rgba(var(--color-sidenav-primary-rgb),0.7)] text-text border border-accent" rows={3} />
														<div className="flex mt-2 space-x-2">
															<button onClick={saveEditedMessage} className="px-4 py-2 bg-accent text-white rounded-xl">Save</button>
															<button onClick={() => setEditingMessageId(null)} className="px-4 py-2 bg-gray-500 text-white rounded-xl">Cancel</button>
														</div>
													</div>
												) : (
													<div>
														{ textPart && <div className="mb-2">{textPart}</div> }
														{ imageAttachments.length > 0 && (
															<div className="image-grid grid gap-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
																{imageAttachments.slice(0,6).map((img, i) => {
																	const showOverlay = imageAttachments.length > 6 && i === 0;
																	return (
																		<div key={i} className="relative cursor-pointer" onClick={() => openGallery(imageAttachments.map(a => ({ url: a.url, name: a.name })), i)}>
																			<img src={img.url} alt={img.name} className={`object-cover w-full h-28 rounded-xl ${showOverlay ? 'opacity-50' : ''}`} />
																			{showOverlay && <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold">+{imageAttachments.length - 6}</div>}
																		</div>
																	);
																})}
															</div>
														)}
														{ fileAttachments.length > 0 && (
															<div className="files-list mt-2 space-y-1">
																{fileAttachments.map((f, i) => (
																	<div key={i} className="p-2 border rounded-xl bg-[rgba(0,0,0,0.05)]">
																		<a href={f.url} download={f.name} target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--file-border-color)]">{f.name}</a>
																	</div>
																))}
															</div>
														)}
													</div>
												)}
											</div>

											{isCurrentUser && !msg.is_deleted && editingMessageId !== msg.message_ID && (
												<div className="flex justify-end mt-2 space-x-2">
													<button onClick={() => handleEditMessage(msg.message_ID, msg.message_content)} className="p-1 text-[var(--color-accent)]" title="Edit"><FaEdit size={16} /></button>
													<button onClick={() => handleDeleteMessage(msg.message_ID)} className="p-1 text-[var(--color-accent)]" title="Delete"><FaTrash size={16} /></button>
												</div>
											)}
										</div>
									);
								})}
								<div ref={messagesEndRef} />
							</div>
							
							{}
							<div className="flex mt-3 animate-slide-up" style={{ animationDelay: "0.4s" }}>
								<div className="flex-1 flex bg-[rgba(var(--color-sidenav-primary-rgb),0.8)] backdrop-blur-sm rounded-2xl border-2 border-accent p-2">
									<textarea value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} className="flex-grow p-3 bg-transparent text-input-txt focus:outline-none resize-none" placeholder="Type a message..." rows={1} style={{ minHeight: '50px', maxHeight: '150px' }} />

									{}
									{files.length > 0 && (
										<div className="ml-3 flex-shrink-0">
											<div className="grid gap-1" style={{ width: 110, gridTemplateColumns: 'repeat(3, 1fr)', gridAutoRows: '34px' }}>
												{files.slice(0,6).map((f, i) => {
													const isImage = f.type && f.type.startsWith && f.type.startsWith('image/');
													const overlayMore = files.length > 6 && i === 0;
													return (
														<div key={i} className="relative rounded-md overflow-hidden cursor-pointer" onClick={() => {
															const images = files.filter(x => x.type && x.type.startsWith && x.type.startsWith('image/')).map(x => ({ url: x.preview || URL.createObjectURL(x.file), name: x.name }));
															if (images.length) openGallery(images, Math.max(0, images.findIndex(img => img.name === f.name)));
														}}>
															{isImage ? <img src={f.preview} alt={f.name} className={`w-full h-full object-cover ${overlayMore ? 'opacity-50' : ''}`} /> : <div className="w-full h-full flex items-center justify-center text-xs bg-[rgba(0,0,0,0.06)]">{f.name.length > 12 ? f.name.slice(0,10)+'…' : f.name}</div>}
															{overlayMore && <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold bg-black/30">+{files.length - 6}</div>}
															<button onClick={(e) => { e.stopPropagation(); removeFileAt(i); }} className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 text-red-500 border" title="Remove"><FaTimesCircle /></button>
														</div>
													);
												})}
											</div>
										</div>
									)}

									<button onClick={handleFileButtonClick} className="p-2 mx-1 bg-gradient-to-r from-blue-600 to-accent text-white rounded-xl"><FaPaperclip size={20} /></button>
									<button onClick={sendMessage} className="p-3 bg-gradient-to-r from-blue-600 to-accent text-white rounded-xl"><FaTelegramPlane size={24} /></button>
								</div>

								<input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" multiple />
							</div>
						</div>
					</div>
				</div>
			</div>

			{}
			{gallery.open && (
				<div className="fixed inset-0 z-50 flex items-center justify-center" onClick={closeGallery}>
					<div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
					<div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-4xl mx-4 rounded-3xl p-4" style={{ background: 'rgba(var(--color-sidenav-primary-rgb),0.95)', border: '2px solid var(--color-accent)', boxShadow: '0 10px 40px rgba(0,0,0,0.6)' }}>

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

						{}
						<div className="mt-4 flex items-center justify-center gap-2">
							{gallery.images.map((_, i) => (
								<div key={i} onClick={() => setGallery(g => ({ ...g, index: i }))} className={`w-2 h-2 rounded-full ${i === gallery.index ? 'bg-[var(--color-accent)]' : 'bg-gray-300'}`} />
							))}
						</div>
					</div>
				</div>
			)}

			<style jsx>{`
				@keyframes fade-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
				@keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
				.animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
				.animate-slide-up { animation: slide-up 0.6s cubic-bezier(0.22, 0.61, 0.36, 1) forwards; opacity: 0; }

				.messages img, .image-grid img { max-width: 100%; height: auto; display: block; }
				.image-grid { word-break: break-word; }
				.messages a { word-break: break-word; }
			`}</style>
		</div>
		</BackgroundImage>
	);
};

export default DirectMessage;
