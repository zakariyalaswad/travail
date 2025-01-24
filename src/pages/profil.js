import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

function Profil() {
    const auth = getAuth();
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (auth.currentUser) {
                try {
                    const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', auth.currentUser.uid)));
                    if (!userDoc.empty) {
                        const user = userDoc.docs[0].data();
                        setUserRole(user.role);
                        setUserData(user);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
                setLoading(false);
            }
        };

        fetchUserData();
    }, [auth.currentUser]);

    const handleEdit = () => {
        setIsEditing(true);
        setEditedData({ ...userData });
    };

    const handleSave = async () => {
        try {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userRef, editedData);
            setUserData(editedData);
            setIsEditing(false);
            // Show success message
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile');
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedData(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <nav className="navbar navbar-expand-lg bg-body-tertiary">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#"><i className="bi bi-person-circle" title='Profil'></i></a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link" to={userRole === 'responsable' ? "/dashresponsable" : "/dashEmployee"}>
                                    <i className="bi bi-house"></i>Home
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/Tache">Tache</Link>
                            </li>
                            {userRole === 'responsable' && (
                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/AjouteTache">Nouvelle Tache</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/employee">Employee</Link>
                                    </li>
                                </>
                            )}
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

            <div className="container mt-4">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="card-title">Mon Profil</h5>
                                    {!isEditing && (
                                        <button 
                                            className="btn btn-primary"
                                            onClick={handleEdit}
                                        >
                                            <i className="bi bi-pencil"></i> Modifier
                                        </button>
                                    )}
                                </div>
                                {userData && !isEditing && (
                                    <div>
                                        <p><strong>Nom:</strong> {userData.nom}</p>
                                        <p><strong>Prénom:</strong> {userData.prenom}</p>
                                        <p><strong>Email:</strong> {userData.email}</p>
                                        <p><strong>Téléphone:</strong> {userData.tel}</p>
                                        <p><strong>Adresse:</strong> {userData.adresse}</p>
                                        <p><strong>Role:</strong> {userData.role}</p>
                                    </div>
                                )}
                                {isEditing && editedData && (
                                    <form>
                                        <div className="mb-3">
                                            <label className="form-label">Nom</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="nom"
                                                value={editedData.nom}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Prénom</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="prenom"
                                                value={editedData.prenom}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                name="email"
                                                value={editedData.email}
                                                onChange={handleChange}
                                                disabled
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Téléphone</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                name="tel"
                                                value={editedData.tel}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Adresse</label>
                                            <textarea
                                                className="form-control"
                                                name="adresse"
                                                value={editedData.adresse}
                                                onChange={handleChange}
                                            ></textarea>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-success"
                                                onClick={handleSave}
                                            >
                                                Enregistrer
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={handleCancel}
                                            >
                                                Annuler
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profil;