import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import navigate from 'navigate';

function DashResponsable(){
    const auth = getAuth();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tachesdata,setTachesdata]=useState({
        titre: '',
        description: '',
        datedebut: '',
        datefin: '',
        employee: '',
        etat:''
    });
    const [tachesEnCours, setTachesEnCours] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const navigate = useNavigate();
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

    const handleEdit = async (id) => {
        try {
            const task = tachesEnCours.find(t => t.id === id);
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
            setTachesEnCours(prev => prev.map(t => 
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
                setTachesEnCours(prev => prev.filter(task => task.id !== id));
                alert("Tâche supprimée avec succès!");
            } catch (error) {
                console.error("Erreur lors de la suppression:", error);
                alert("Erreur lors de la suppression de la tâche");
            }
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

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
                                <a className="nav-link active" aria-current="page" href="#"><i className="bi bi-house"></i>Home</a>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/Tache">Tache</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/AjouteTache">Nouvelle Tache</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/employee">Employee</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/Chat">Chat</Link>
                            </li>
                            <li>
                                <Link className="nav-link btn btn-danger" to="/" onClick={() => {
                                    auth.signOut();
                                    navigate('/', { replace: true });
                                }}>Log Out</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
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
                                    <button 
                                        className="btn btn-primary"
                                        onClick={() => handleEdit(task.id)}
                                    >
                                        <i className="bi bi-pencil"></i> Modifier
                                    </button>
                                    <button 
                                        className="btn btn-danger"
                                        onClick={() => handleDelete(task.id)}
                                    >
                                        <i className="bi bi-trash"></i> Supprimer
                                    </button>
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
};

export default DashResponsable;
