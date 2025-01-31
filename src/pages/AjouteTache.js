import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

function AjouteTache() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [taches, setTaches] = useState([]);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loadingTache, setLoadingTache] = useState(false);
    const [loadingAdd, setLoadingAdd] = useState(false);
    const [formdata, setformdata] = useState({
        titre: '',
        description: '',
        datedebut: '',
        datefin: '',
        employee: '',
        employeeUid: ''
    });
    const [employees, setEmployees] = useState([]);

    const getEmployees = async () => {
        const q = query(collection(db, 'users'), where('role', '==', 'employee'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id 
        }));
        setEmployees(data);
    };

    useEffect(() => {
        getEmployees();
    }, []);

    const handleChange = (e) => {
        const { id, value } = e.target;
        if (id === 'employee') {
            const selectedEmployee = employees.find(emp => emp.uid === value);
            if (selectedEmployee) {
                setformdata(prevState => ({
                    ...prevState,
                    employeeUid: selectedEmployee.uid,
                    employee: `${selectedEmployee.nom} ${selectedEmployee.prenom}`
                }));
            }
        } else {
            setformdata(prevState => ({
                ...prevState,
                [id]: value
            }));
        }
    };

    const signOut = async () => {
        try {
            const auth = getAuth();
            await firebaseSignOut(auth);
            navigate('/', { replace: true });
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingAdd(true);
        setMessage({ text: '', type: '' });
        
        try {
            const datedebut = new Date(formdata.datedebut);
            const datefin = new Date(formdata.datefin);
            const currentdate = new Date();

            // Enlever les heures/minutes/secondes pour comparer uniquement les dates
            currentdate.setHours(0, 0, 0, 0);
            datefin.setHours(0, 0, 0, 0);
            
            if (datedebut > datefin) {
                throw new Error('La date de début doit être inférieure à la date de fin');
            }

            if (datefin <= currentdate) {
                throw new Error('La date de fin doit être strictement supérieure à la date d\'aujourd\'hui');
            }

            const taskData = {
                ...formdata,
                etat: currentdate < datedebut ? "A faire" : "En cour",
                createdAt: new Date().toISOString()
            };

            const docRef = await addDoc(collection(db, 'taches'), taskData);
            setMessage({ text: 'Tâche ajoutée avec succès', type: 'success' });
            console.log("Document written with ID: ", docRef.id);
            // Reset form
            setformdata({
                titre: '',
                description: '',
                datedebut: '',
                datefin: '',
                employee: '',
                employeeUid: ''
            });
        } catch (error) {
            console.error("Error adding document: ", error);
            setMessage({ 
                text: error.message || 'Erreur lors de l\'ajout de la tache', 
                type: 'error' 
            });
        } finally {
            setLoadingAdd(false);
        }
    };

    return (
        <div className="dashboard-layout">
            <div className="sidebar">
                <div className="sidebar-header">
                    <i className="bi bi-person-circle profile-icon"></i>
                    <span className="admin-name">Admin</span>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/dashresponsable" className="sidebar-link">
                        <i className="bi bi-house"></i>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/AjouteTache" className="sidebar-link active">
                        <i className="bi bi-plus-circle"></i>
                        <span>Nouvelle Tâche</span>
                    </Link>
                    <Link to="/employee" className="sidebar-link">
                        <i className="bi bi-people"></i>
                        <span>Employés</span>
                    </Link>
                    <Link to="/Chat" className="sidebar-link">
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
                        onClick={() => {
                            signOut();
                            navigate('/', { replace: true });
                        }}
                    >
                        <i className="bi bi-box-arrow-right"></i>
                        <span>Déconnexion</span>
                    </Link>
                </nav>
            </div>
            <div className="main-content">
                <form onSubmit={handleSubmit}>
                    <h1>Nouvelle Tache</h1>
                    <div className="container">
                        {/* Ajouter l'affichage des messages ici */}
                        {message.text && (
                            <div className={`message ${message.type}`}>
                                {message.text}
                            </div>
                        )}
                        
                        {loadingAdd && (
                            <div className="loading">
                                <div class="d-flex justify-content-center">
                                    <div class="spinner-border" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <label>Titre</label>
                        <input type='text' id="titre" value={formdata.titre} onChange={handleChange} required/>
                        <br/>
                        <br/>
                        <label>Description</label>
                        <input type='text' id="description" value={formdata.description} onChange={handleChange} required/>
                        <br/>
                        <br/>
                        <label>Date de debut</label>
                        <input type='date' id="datedebut" value={formdata.datedebut} onChange={handleChange} required/>
                        <br/>
                        <br/>
                        <label>Date de fin</label>
                        <input type='date' id="datefin" value={formdata.datefin} onChange={handleChange} required/>
                        <br/>
                        <br/>
                        <label>Employee</label>
                        <select id="employee" className="form-control" value={formdata.employeeUid} onChange={handleChange} required>
                            <option value=''>Selectionner un employee</option>
                            <hr/>
                            {employees.map(employee => (
                                <option key={employee.uid} value={employee.uid}>{employee.nom} {employee.prenom}</option>
                            ))}
                        </select>
                        <br/>
                        <br/>
                        <button type='submit'>Ajouter</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AjouteTache;