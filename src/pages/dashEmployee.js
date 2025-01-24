import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';   
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

function DashEmployee() {
    const auth = getAuth();
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const fetchUserRole = async () => {
            if (auth.currentUser) {
                try {
                    const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', auth.currentUser.uid)));
                    if (!userDoc.empty) {
                        setUserRole(userDoc.docs[0].data().role);
                    }
                } catch (error) {
                    console.error('Error fetching user role:', error);
                }
            }
        };
        
        fetchUserRole();
    }, [auth.currentUser]);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <div>
            <nav className="navbar navbar-expand-lg bg-body-tertiary">
                <div className="container-fluid">
                    <Link className="nav-link" to="/profil"><i className="bi bi-person-circle" title='Profil'></i></Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link active" aria-current="page" to="/dashEmployee">
                                    <i className="bi bi-house"></i>Home
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/Tache">Tache</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/Chat">Chat</Link>
                            </li>
                            <li>
                                <Link className="nav-link btn btn-danger" to="/" onClick={handleLogout}>Log Out</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <div>
                <h1>bienvenue au page employee</h1>
            </div>
        </div>
    );
}

export default DashEmployee;
