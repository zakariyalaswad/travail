import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

function DashResponsable() {
    const auth = getAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [allTasks, setAllTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const q = query(collection(db, 'taches'));
                const querySnapshot = await getDocs(q);
                const tasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAllTasks(tasks);
                setFilteredTasks(tasks);
                setLoading(false);
            } catch (error) {
                console.error("Erreur lors de la récupération des tâches:", error);
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    useEffect(() => {
        filterTasks(filterStatus);
    }, [filterStatus, allTasks]);

    const filterTasks = (status) => {
        if (status === 'all') {
            setFilteredTasks(allTasks);
        } else {
            setFilteredTasks(allTasks.filter(task => task.etat === status));
        }
    };

    const handleConfirm = async (id) => {
        const task = allTasks.find(t => t.id === id);
        if (!task) {
            alert('Tâche non trouvée');
            return;
        }

        if (task.etat !== 'Terminée') {
            alert('Seules les tâches terminées peuvent être confirmées');
            return;
        }

        const confirmation = window.confirm(`Êtes-vous sûr de vouloir confirmer la tâche "${task.titre}" ?`);
        if (!confirmation) return;

        try {
            const taskRef = doc(db, 'taches', id);
            const updateData = {
                etat: 'Confirmée'
            };

            await updateDoc(taskRef, updateData);
            
            // Mise à jour locale
            setAllTasks(prev => prev.map(task => 
                task.id === id ? { ...task, ...updateData } : task
            ));
            setFilteredTasks(prev => prev.map(task => 
                task.id === id ? { ...task, ...updateData } : task
            ));

            alert(`La tâche "${task.titre}" a été confirmée avec succès !`);
        } catch (error) {
            console.error('Erreur lors de la confirmation:', error);
            alert(`Erreur lors de la confirmation: ${error.message}`);
        }
    };

    const handleRefuser = async (id) => {
        const task = allTasks.find(t => t.id === id);
        if (!task) {
            alert('Tâche non trouvée');
            return;
        }

        if (task.etat !== 'Terminée') {
            alert('Seules les tâches terminées peuvent être refusées');
            return;
        }
        const Refuser = window.confirm(`Êtes-vous sû    r de vouloir refuser la tâche "${task.titre}" ?`);
        if (!Refuser) return;

        try {
            const taskRef = doc(db, 'taches', id);
            const updateData = {
                etat: 'Refusée'
            };

            await updateDoc(taskRef, updateData);
            
            // Mise à jour locale
            setAllTasks(prev => prev.map(task => 
                task.id === id ? { ...task, ...updateData } : task
            ));
            setFilteredTasks(prev => prev.map(task => 
                task.id === id ? { ...task, ...updateData } : task
            ));

            alert(`La tâche "${task.titre}" a été refusée avec succès !`);
        } catch (error) {
            console.error('Erreur lors du refus:', error);
            alert(`Erreur lors du refus: ${error.message}`);
        }
    };

    const handleEdit = async (id) => {
        try {
            const task = allTasks.find(t => t.id === id);
            if (!task) return;

            const updatedTitle = window.prompt("Nouveau titre:", task.titre);
            const updatedDesc = window.prompt("Nouvelle description:", task.description);

            if (!updatedTitle && !updatedDesc) return;

            const taskRef = doc(db, 'taches', id);
            const updates = {};
            
            if (updatedTitle) updates.titre = updatedTitle;
            if (updatedDesc) updates.description = updatedDesc;
            updates.dateModification = new Date().toISOString();

            await updateDoc(taskRef, updates);

            // Mise à jour locale
            setAllTasks(prev => prev.map(t => 
                t.id === id ? { ...t, ...updates } : t
            ));
            setFilteredTasks(prev => prev.map(t => 
                t.id === id ? { ...t, ...updates } : t
            ));

            alert("Tâche modifiée avec succès!");
        } catch (error) {
            console.error("Erreur lors de la modification:", error);
            alert("Erreur lors de la modification de la tâche");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
            try {
                await deleteDoc(doc(db, 'taches', id));
                setAllTasks(prev => prev.filter(task => task.id !== id));
                setFilteredTasks(prev => prev.filter(task => task.id !== id));
                alert("Tâche supprimée avec succès!");
            } catch (error) {
                console.error("Erreur lors de la suppression:", error);
                alert("Erreur lors de la suppression de la tâche");
            }
        }
    };

    if (loading) {
        return <div class="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    }

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <i className="bi bi-person-circle profile-icon"></i>
                    <span className="admin-name">{auth.currentUser.nom||'Admin'}</span>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/dashresponsable" className="sidebar-link active">
                        <i className="bi bi-house"></i>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/AjouteTache" className="sidebar-link">
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
                            auth.signOut();
                            navigate('/', { replace: true });
                        }}
                    >
                        <i className="bi bi-box-arrow-right"></i>
                        <span>Déconnexion</span>
                    </Link>
                </nav>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <div className="dashboard-container">
                    <h1>Tableau de bord du responsable</h1>
                    
                    <div className="filter-container">
                        <select 
                            className="form-select status-filter"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">Toutes les tâches</option>
                            <option value="A faire">À faire</option>
                            <option value="En cour">En cours</option>
                            <option value="Terminée">Terminées</option>
                            <option value="Confirmée">Confirmées</option>
                            <option value="Refusée">Refusées</option>
                        </select>
                        
                        <div className="tasks-count">
                            Total: {filteredTasks.length} tâches
                        </div>
                    </div>
                    
                    <div className="tasks-grid">
                        {loading ? (
                            <div className="loading">Chargement des tâches...</div>
                        ) : filteredTasks.length > 0 ? (
                            filteredTasks.map(task => (
                                <div key={task.id} className="task-card">
                                    <div className="task-header">
                                        <h3>{task.titre}</h3>
                                        <span className={`status-badge status-${task.etat.toLowerCase().replace(' ', '-')}`}>
                                            {task.etat}
                                        </span>
                                    </div>
                                    <div className="task-body">
                                        <p><strong>Description:</strong> {task.description}</p>
                                        <p><strong>Assigné à:</strong> {task.employee}</p>
                                        <p><strong>Début:</strong> {new Date(task.datedebut).toLocaleDateString()}</p>
                                        <p><strong>Fin:</strong> {new Date(task.datefin).toLocaleDateString()}</p>
                                    </div>
                                    <div className="task-actions">
                                        {task.etat === 'Terminée' ? (
                                            <>
                                                <button 
                                                    className="btn-custom btn-confirm"
                                                    onClick={() => handleConfirm(task.id)}
                                                >
                                                    <i className="bi bi-check-circle"></i> Confirmer
                                                </button>
                                                <button 
                                                    className="btn-custom btn-refuse"
                                                    onClick={() => handleRefuser(task.id)}
                                                >
                                                    <i className="bi bi-x-circle"></i> Refuser
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button 
                                                    className="btn-custom btn-primary"
                                                    onClick={() => handleEdit(task.id)}
                                                >
                                                    <i className="bi bi-pencil"></i> Modifier
                                                </button>
                                                <button 
                                                    className="btn-custom btn-danger"
                                                    onClick={() => handleDelete(task.id)}
                                                >
                                                    <i className="bi bi-trash"></i> Supprimer
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-tasks">
                                <i className="bi bi-calendar-x"></i>
                                <p>Aucune tâche trouvée</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashResponsable;
