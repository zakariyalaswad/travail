import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';   
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

function DashEmployee() {
    const auth = getAuth();
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filteredTasks, setFilteredTasks] = useState([]);

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

    useEffect(() => {
        const fetchTasks = async () => {
            if (auth.currentUser) {
                setLoading(true);
                try {
                    const q = query(
                        collection(db, 'taches'),
                        where('employeeUid', '==', auth.currentUser.uid)
                    );
                    const querySnapshot = await getDocs(q);
                    const tasksData = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setTasks(tasksData);
                    setFilteredTasks(tasksData);
                } catch (error) {
                    console.error('Error fetching tasks:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchTasks();
    }, [auth.currentUser]);

    useEffect(() => {
        filterTasks(filterStatus);
    }, [filterStatus, tasks]);

    const filterTasks = (status) => {
        if (status === 'all') {
            setFilteredTasks(tasks);
        } else {
            setFilteredTasks(tasks.filter(task => task.etat === status));
        }
    };

    const handleMarkAsComplete = async (taskId) => {
        try {
            const taskRef = doc(db, 'taches', taskId);
            await updateDoc(taskRef, {
                etat: 'Terminée',
                dateTerminee: new Date().toISOString()
            });
            
            setTasks(prev => prev.map(task => 
                task.id === taskId 
                    ? { ...task, etat: 'Terminée', dateTerminee: new Date().toISOString() }
                    : task
            ));
            
            alert('Tâche marquée comme terminée avec succès!');
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Erreur lors de la mise à jour de la tâche');
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
            <div className="dashboard-container">
                <h1>Tableau de bord de l'employé</h1>
                
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
                                    <p><strong>Début:</strong> {new Date(task.datedebut).toLocaleDateString()}</p>
                                    <p><strong>Fin:</strong> {new Date(task.datefin).toLocaleDateString()}</p>
                                    {task.motifRefus && (
                                        <p className="refus-message">
                                            <strong>Motif de refus:</strong> {task.motifRefus}
                                        </p>
                                    )}
                                </div>
                                <div className="task-actions">
                                    {task.etat !== 'Terminée' && task.etat !== 'Confirmée' && task.etat !== 'Refusée' && (
                                        <button 
                                            className="btn btn-success"
                                            onClick={() => handleMarkAsComplete(task.id)}
                                        >
                                            <i className="bi bi-check-circle"></i> Marquer comme terminée
                                        </button>
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
    );
}

export default DashEmployee;
