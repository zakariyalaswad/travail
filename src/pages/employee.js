import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc,deleteDoc} from 'firebase/firestore';
import { db } from '../firebase';
import navigate from 'navigate';

function Employer() {
    const auth = getAuth();
    const [employees, setEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const getEmployees = async () => {
        const q = query(collection(db, 'users'), where('role', '==', 'employee'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEmployees(data);
    };

    useEffect(() => {
        getEmployees();
    }, []);

    const handleDelete = async (uid) => {
        const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer cet employé ?");
        if (!confirmDelete) return;

        try {
            const q = query(collection(db, 'users'), where('uid', '==', uid));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                alert("Employé non trouvé");
                return;
            }

            querySnapshot.forEach(async (document) => {
                await deleteDoc(document.ref);
            });

            setEmployees(employees.filter(employee => employee.uid !== uid));
            alert("Employé supprimé avec succès");
        } catch (error) {
            console.error("Error deleting employee: ", error);
            alert("Erreur lors de la suppression de l'employé");
        }
    };

    const handleShowProfile = (employee) => {
        setSelectedEmployee(employee);
        setShowModal(true);
    };

    const filteredEmployees = employees.filter(employee =>
        employee.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.prenom.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <Link to="/AjouteTache" className="sidebar-link">
                        <i className="bi bi-plus-circle"></i>
                        <span>Nouvelle Tâche</span>
                    </Link>
                    <Link to="/employee" className="sidebar-link active">
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
                            auth.signOut();
                            navigate('/', { replace: true });
                        }}
                    >
                        <i className="bi bi-box-arrow-right"></i>
                        <span>Déconnexion</span>
                    </Link>
                </nav>
            </div>
            <div className="main-content">
                <div className="employee-container">
                    <h1 className="employee-title">Liste des Employés</h1>
                    
                    <div className="search-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Rechercher un employé..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="employee-grid">
                        {filteredEmployees.map(employee => (
                            <div key={employee.uid} className="employee-card">
                                <div className="employee-avatar">
                                    <i className="bi bi-person-circle"></i>
                                </div>
                                <div className="employee-info">
                                    <h3>{employee.nom} {employee.prenom}</h3>
                                    <p><i className="bi bi-envelope"></i> {employee.email}</p>
                                    <p><i className="bi bi-telephone"></i> {employee.tel}</p>
                                </div>
                                <div className="employee-actions">
                                    <button 
                                        className="btn btn-info"
                                        onClick={() => handleShowProfile(employee)}
                                    >
                                        <i className="bi bi-eye"></i> Voir profil
                                    </button>
                                    <button 
                                        className="btn btn-danger"
                                        onClick={() => handleDelete(employee.uid)}
                                    >
                                        <i className="bi bi-trash"></i> Supprimer
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Modal pour afficher les détails du profil */}
                    {showModal && selectedEmployee && (
                        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Profil de {selectedEmployee.nom} {selectedEmployee.prenom}</h5>
                                        <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                    </div>
                                    <div className="modal-body">
                                        <p><strong>Email:</strong> {selectedEmployee.email}</p>
                                        <p><strong>Téléphone:</strong> {selectedEmployee.tel}</p>
                                        <p><strong>Date d'inscription:</strong> {selectedEmployee.dateCreated}</p>
                                        <p><strong>Département:</strong> {'Developpemnent'}</p>
                                        <p><strong>Poste:</strong> {selectedEmployee.role}</p>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                            Fermer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Employer;