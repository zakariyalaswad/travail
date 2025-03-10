import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, getDocs, where, addDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

function Chat() {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingEmployees, setLoadingEmployees] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [authUser, setAuthUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const [conversations, setConversations] = useState([]);
    const auth = getAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setAuthUser(user);
            if (user) {
                // Fetch user role from Firestore
                try {
                    const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
                    if (!userDoc.empty) {
                        setUserRole(userDoc.docs[0].data().role);
                    }
                } catch (error) {
                    console.error('Error fetching user role:', error);
                }
            }
            setLoading(false);
            if (!user) {
                navigate('/', { replace: true });
            }
        });

        return () => unsubscribe();
    }, [auth, navigate]);

    useEffect(() => {
        if (!authUser) return; // Don't fetch if not authenticated

        const fetchEmployees = async () => {
            setLoadingEmployees(true);
            try {
                const q = query(collection(db, 'users'));
                const querySnapshot = await getDocs(q);
                const employeesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                const filteredEmployees = employeesList.filter(employee => employee.uid !== authUser.uid); // Exclude current user
                console.log('Fetched employees:', filteredEmployees); // Log fetched employees
                setEmployees(filteredEmployees);
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
            setLoadingEmployees(false);
        };

        fetchEmployees();
    }, [authUser]);

    useEffect(() => {
        if (selectedEmployee && authUser) {
            const fetchMessages = async () => {
                setLoadingMessages(true);
                try {
                    // Query messages where either user is a participant
                    const q = query(
                        collection(db, 'messages'),
                        where('participants', 'array-contains-any', [authUser.uid, selectedEmployee.uid])
                    );
                    const querySnapshot = await getDocs(q);
                    const messagesList = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    })).filter(message => 
                        message.participants.includes(authUser.uid) && 
                        message.participants.includes(selectedEmployee.uid)
                    ).sort((a, b) => a.timestamp?.toDate() - b.timestamp?.toDate());

                    setMessages(messagesList);
                } catch (error) {
                    console.error('Error fetching messages:', error);
                }
                setLoadingMessages(false);
            };

            fetchMessages();
        }
    }, [selectedEmployee, authUser]);

    const handleSendMessage = useCallback(async () => {
        if (newMessage.trim() === '' || !authUser || !selectedEmployee) return;

        try {
            await addDoc(collection(db, 'messages'), {
                text: newMessage,
                participants: [authUser.uid, selectedEmployee.uid],
                senderId: authUser.uid,
                timestamp: new Date(),
            });
            setNewMessage('');
            // No need to set selectedEmployee again, the useEffect will handle message refresh
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }, [newMessage, selectedEmployee, authUser]);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const employeeList = useMemo(() => (
        employees.map(employee => (
            <li key={employee.id} className="list-group-item" onClick={() => setSelectedEmployee(employee)}>
                {employee.nom} {employee.prenom}
            </li>
        ))
    ), [employees]);

    const messageList = useMemo(() => (
        messages.map(message => (
            <div 
                key={message.id} 
                className={`message ${message.senderId === authUser?.uid ? 'sent' : 'received'}`}
                style={{
                    marginBottom: '10px',
                    padding: '10px',
                    borderRadius: '10px',
                    maxWidth: '70%',
                    alignSelf: message.senderId === authUser?.uid ? 'flex-end' : 'flex-start',
                    backgroundColor: message.senderId === authUser?.uid ? '#007bff' : '#e9ecef',
                    color: message.senderId === authUser?.uid ? 'white' : 'black',
                }}
            >
                <p style={{ margin: 0 }}>{message.text}</p>
                <small style={{ 
                    fontSize: '0.8em',
                    opacity: 0.7,
                    display: 'block',
                    textAlign: message.senderId === authUser?.uid ? 'right' : 'left'
                }}>
                    {message.timestamp?.toDate().toLocaleTimeString()}
                </small>
            </div>
        ))
    ), [messages, authUser]);

    if (loading) {
        return <div>
            <div class="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>;
    }

    if (!authUser) {
        return null;
    }

    return (
        <div className="dashboard-layout">
            <div className="sidebar">
                <div className="sidebar-header">
                    <i className="bi bi-person-circle profile-icon"></i>
                    <span className="admin-name">Admin</span>
                </div>
                <nav className="sidebar-nav">
                    <Link to={userRole === 'responsable' ? "/dashresponsable" : "/dashEmployee"} className="sidebar-link">
                        <i className="bi bi-house"></i>
                        <span>Dashboard</span>
                    </Link>
                    {userRole === 'responsable' && (
                        <>
                            <Link to="/AjouteTache" className="sidebar-link">
                                <i className="bi bi-plus-circle"></i>
                                <span>Nouvelle Tâche</span>
                            </Link>
                            <Link to="/employee" className="sidebar-link">
                                <i className="bi bi-people"></i>
                                <span>Employés</span>
                            </Link>
                        </>
                    )}
                    <Link to="/Chat" className="sidebar-link active">
                        <i className="bi bi-chat"></i>
                        <span>Chat</span>
                    </Link>
                    <Link to="/profil" className="sidebar-link">
                        <i className="bi bi-person"></i>
                        <span>Profil</span>
                    </Link>
                    <Link 
                        to="/" 
                        className="sidebar-link logout"
                        onClick={handleLogout}
                    >
                        <i className="bi bi-box-arrow-right"></i>
                        <span>Déconnexion</span>
                    </Link>
                </nav>
            </div>
            <div className="main-content">
                <div className="container mt-4">
                    <div className="row">
                        <div className="col-md-4">
                            <h5>messanger</h5>
                            {loadingEmployees ? <div class="d-flex justify-content-center align-items-center" style={{ height: '100%' }}>
                                                    <div class="spinner-border" role="status">
                                                        <span class="visually-hidden">Loading...</span>
                                                    </div>
                                                    </div> : <ul className="list-group">{employeeList}</ul>}
                        </div>
                        <div className="col-md-8">
                            {selectedEmployee && (
                                <div>
                                    <h5>Chat with {selectedEmployee.nom}</h5>
                                    <div className="chat-box" style={{
                                        height: '400px',
                                        overflowY: 'auto',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        padding: '20px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '10px',
                                        marginBottom: '20px'
                                    }}>
                                        {loadingMessages ? <div class="d-flex justify-content-center align-items-center" style={{ height: '100%' }}>
                                                                <div class="spinner-border" role="status">
                                                                    <span class="visually-hidden">Loading...</span>
                                                                </div>
                                                                </div> : messageList}
                                    </div>
                                    <div className="input-group mt-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Type a message"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        />
                                        <button className="btn btn-primary" onClick={handleSendMessage}>
                                            Send
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Chat;