import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import DataTable from 'datatables.net-dt';

function Tache() {
    const navigate = useNavigate();
    const auth = getAuth();
    const [userRole, setUserRole] = useState(null);
    const [formdata, setFormData] = useState([]); // Pour stocker les tâches récupérées
    const tableRef = useRef(null); // Référence au tableau HTML
    const [table, setTable] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Fonction pour récupérer les tâches depuis Firebase
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Récupérer les documents de la collection "taches"
                const tacheCollection = collection(db, 'taches'); // Remplace "taches" par le nom de ta collection
                const querySnapshot = await getDocs(tacheCollection);

                // Transformer les données Firestore en tableau
                const data = querySnapshot.docs.map((doc) => ({
                    ...doc.data(), // Les champs du document
                    id: doc.id,    // ID du document
                }));

                setFormData(data); // Met à jour le state avec les données récupérées
            } catch (error) {
                console.error('Erreur lors de la récupération des données :', error);
            }
        };

        fetchData();
    }, []);

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

    const handleConfirm = async (id) => {
        const task = formdata.find(t => t.id === id);
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

        setIsLoading(true);
        try {
            const taskRef = doc(db, 'taches', id);
            const updateData = {
                etat: 'Confirmée',
                dateConfirmation: new Date().toISOString(),
                confirmeePar: auth.currentUser.email,
                dateModification: new Date().toISOString(),
                historique: [{
                    action: 'Confirmation',
                    date: new Date().toISOString(),
                    par: auth.currentUser.email,
                    ancienetat: task.etat,
                    nouveletat: 'Confirmée'
                }]
            };

            await updateDoc(taskRef, updateData);
            
            // Mise à jour du state local
            const updatedData = formdata.map(task => 
                task.id === id ? { 
                    ...task,
                    ...updateData
                } : task
            );
            setFormData(updatedData);
            
            // Rafraîchir la table
            if (table) {
                table.clear().rows.add(updatedData.map(item => [
                    item.titre,
                    item.description,
                    item.datedebut,
                    item.datefin,
                    item.employee,
                    `<span class="status-${item.etat.toLowerCase().replace(' ', '-')}">${item.etat}</span>`,
                    userRole === 'responsable' && item.etat === 'Terminée' ? 
                    `<div class="btn-group" role="group">
                        <button onclick="handleConfirm('${item.id}')" class="btn btn-success btn-sm">
                            Confirmer
                        </button>
                        <button onclick="handleRefuser('${item.id}')" class="btn btn-danger btn-sm">
                            Refuser
                        </button>
                    </div>` : 
                    item.etat === 'Confirmée' ? 
                    '<span class="badge bg-success">Confirmée</span>' :
                    item.etat === 'Refusée' ? 
                    '<span class="badge bg-danger">Refusée</span>' : ''
                ])).draw();
            }

            alert(`La tâche "${task.titre}" a été confirmée avec succès !`);
        } catch (error) {
            console.error('Erreur lors de la confirmation:', error);
            alert(`Erreur lors de la confirmation: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefuser = async (id) => {
        const task = formdata.find(t => t.id === id);
        if (!task) {
            alert('Tâche non trouvée');
            return;
        }

        if (task.etat !== 'Terminée') {
            alert('Seules les tâches terminées peuvent être refusées');
            return;
        }

        const motifRefus = window.prompt('Veuillez entrer le motif du refus (minimum 10 caractères) :');
        if (!motifRefus || motifRefus.length < 10) {
            alert('Veuillez fournir un motif de refus détaillé (minimum 10 caractères)');
            return;
        }

        setIsLoading(true);
        try {
            const taskRef = doc(db, 'taches', id);
            const updateData = {
                etat: 'Refusée',
                motifRefus,
                dateRefus: new Date().toISOString(),
                refuseePar: auth.currentUser.email,
                dateModification: new Date().toISOString(),
                historique: [{
                    action: 'Refus',
                    date: new Date().toISOString(),
                    par: auth.currentUser.email,
                    motif: motifRefus,
                    ancienetat: task.etat,
                    nouveletat: 'Refusée'
                }]
            };

            await updateDoc(taskRef, updateData);
            
            // Mise à jour du state local et rafraîchissement de la table
            const updatedData = formdata.map(task => 
                task.id === id ? { ...task, ...updateData } : task
            );
            setFormData(updatedData);
            
            if (table) {
                // Rafraîchir la table avec les nouvelles données
                table.clear().rows.add(updatedData.map(item => [
                    item.titre,
                    item.description,
                    item.datedebut,
                    item.datefin,
                    item.employee,
                    `<span class="status-${item.etat.toLowerCase().replace(' ', '-')}">${item.etat}</span>`,
                    userRole === 'responsable' && item.etat === 'Terminée' ? 
                    `<div class="btn-group" role="group">
                        <button onclick="handleConfirm('${item.id}')" class="btn btn-success btn-sm">
                            Confirmer
                        </button>
                        <button onclick="handleRefuser('${item.id}')" class="btn btn-danger btn-sm">
                            Refuser
                        </button>
                    </div>` : 
                    item.etat === 'Confirmée' ? 
                    '<span class="badge bg-success">Confirmée</span>' :
                    item.etat === 'Refusée' ? 
                    '<span class="badge bg-danger">Refusée</span>' : ''
                ])).draw();
            }

            alert(`La tâche "${task.titre}" a été refusée avec succès !`);
        } catch (error) {
            console.error('Erreur lors du refus:', error);
            alert(`Erreur lors du refus: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Cleanup function for DataTable
    useEffect(() => {
        return () => {
            if (table) {
                table.destroy();
            }
        };
    }, [table]);

    // Initialize DataTable
    useEffect(() => {
        if (formdata.length > 0 && !table && tableRef.current) {
            // Ajouter les gestionnaires d'événements au window
            window.handleConfirm = async (id) => {
                try {
                    const taskRef = doc(db, 'taches', id);
                    await updateDoc(taskRef, { etat: 'Confirmée' });
                    // Rafraîchir les données après la confirmation
                    const updatedData = formdata.map(task => 
                        task.id === id ? { ...task, etat: 'Confirmée' } : task
                    );
                    setFormData(updatedData);
                } catch (error) {
                    console.error('Erreur lors de la confirmation:', error);
                }
            };

            window.handleRefuser = async (id) => {
                try {
                    const taskRef = doc(db, 'taches', id);
                    await updateDoc(taskRef, { etat: 'Refusée' });
                    const updatedData = formdata.map(task => 
                        task.id === id ? { ...task, etat: 'Refusée' } : task
                    );
                    setFormData(updatedData);
                } catch (error) {
                    console.error('Erreur lors du refus:', error);
                }
            };

            const newTable = new DataTable(tableRef.current, {
                destroy: true,
                data: formdata.map((item) => [
                    item.titre,
                    item.description,
                    item.datedebut,
                    item.datefin,
                    item.employee,
                    `<span class="status-${item.etat.toLowerCase().replace(' ', '-')}">${item.etat}</span>`,
                    userRole === 'responsable' && item.etat === 'Terminée' ? 
                    `<div class="btn-group" role="group">
                        <button onclick="handleConfirm('${item.id}')" class="btn btn-success btn-sm">
                            Confirmer
                        </button>
                        <button onclick="handleRefuser('${item.id}')" class="btn btn-danger btn-sm">
                            Refuser
                        </button>
                    </div>` : 
                    item.etat === 'Confirmée' ? 
                    '<span class="badge bg-success">Confirmée</span>' :
                    item.etat === 'Refusée' ? 
                    '<span class="badge bg-danger">Refusée</span>' : ''
                ]),
                columns: [
                    { title: 'Titre' },
                    { title: 'Description' },
                    { title: 'Date Début' },
                    { title: 'Date Fin' },
                    { title: 'Assigné à' },
                    { title: 'État' },
                    { title: 'Actions', orderable: false, searchable: false }
                ],
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/fr-FR.json'
                },
                pageLength: 10,
                responsive: true,
                dom: '<"top"lf>rt<"bottom"ip>',
                createdRow: function(row, data, dataIndex) {
                    row.classList.add('task-row');
                }
            });

            setTable(newTable);

            // Cleanup function
            return () => {
                delete window.handleConfirm;
                delete window.handleRefuser;
                if (table) {
                    table.destroy();
                }
            };
        }
    }, [formdata, userRole]);

    return (
        <div>
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg bg-body-tertiary">
                <div className="container-fluid">
                    <Link className="nav-link" to="/profil"><i className="bi bi-person-circle" title='Profil'></i></Link>
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
                                <Link className="nav-link active" aria-current="page" to="/Tache">Tache</Link>
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
                                <Link className="nav-link btn btn-danger" to="/" onClick={handleLogout}>
                                    Log Out
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            <div className="task-container">
                <h2 className="task-header">Gestion des Tâches</h2>
                <div className="task-table-wrapper">
                    <div className="table-responsive">
                        <table ref={tableRef} className="task-table display">
                            <thead>
                                <tr>
                                    <th>Titre</th>
                                    <th>Description</th>
                                    <th>Date Début</th>
                                    <th>Date Fin</th>
                                    <th>Assigné à</th>
                                    <th>État</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Tache;
