import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const Algorithm = ({ studentId, moduleId }) => {
    const [isInQueue, setIsInQueue] = useState(false);
    const [groupStatus, setGroupStatus] = useState('Enter the queue if you are looking for a group. If you have already entered the queue previously and wish to exit it please click the button below twice.');

    useEffect(() => {
        // Setup socket listeners
        socket.on('group_formation_results', data => {
            if (data.module_ID === moduleId) {
                const foundGroup = data.groups.find(group => group.group.some(member => parseInt(member.studentId) === studentId));
                if (foundGroup) {
                    setIsInQueue(false); // Automatically update when in a group
                    setGroupStatus(`You are in a group. Group ID: ${foundGroup.group_id}`);
                }
            }
        });

        return () => {
            socket.off('group_formation_results');
        };
    }, [studentId, moduleId]);

    // Put user in the queue and tell them
    const enterQueue = () => {
        setIsInQueue(true);
        setGroupStatus('You are in the queue. Please check this page later to see if you are in a new group. If you wish to exit click the button below.');
        socket.emit('join_group_queue', { student_ID: studentId, module_ID: moduleId });
    };

    // Put user OUT of the queue and tell them
    const exitQueue = () => {
        if (isInQueue) {
            setIsInQueue(false);
            setGroupStatus('You have exited the queue. Enter again if you wish.');
            socket.emit('leave_group_queue', { student_ID: studentId, module_ID: moduleId });
        }
    };    

    // Group formation panel
    return (
        <div className='p-4 rounded-3xl shadow-lg mt-4 border-2 border-accent backdrop-blur-sm animate-fade-in'
            style={{
                background: 'rgba(var(--color-tertiary-rgb), 0.7)',
                animationDelay: "0.2s"
            }}>
            <h2 className='text-2xl font-bold mb-4 text-center bg-gradient-to-r from-accent to-blue-400 text-transparent bg-clip-text'>
                Group Formation Panel
            </h2>
            <p className='text-lg mb-4 text-center text-info-txt p-3 rounded-2xl bg-[rgba(var(--color-sidenav-primary-rgb),0.6)]'>
                {groupStatus}
            </p>
            <div className="flex justify-center">
                <button
                    className={`py-3 px-6 rounded-2xl font-bold text-white transition-all duration-300 $${
                        isInQueue 
                            ? 'bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800' 
                            : 'bg-gradient-to-r from-accent to-blue-500 hover:from-blue-500 hover:to-accent'
                    } shadow-lg hover:shadow-[0_0_15px_var(--color-accent)]`}
                    onClick={isInQueue ? exitQueue : enterQueue}>
                    {isInQueue ? 'Exit Queue' : 'Enter Queue'}
                </button>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Algorithm;