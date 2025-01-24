import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import DataTable from 'datatables.net-dt';

function Tache() {
    const navigate = useNavigate();
    const auth = getAuth();
    const [userRole, setUserRole] = useState(null);
    const [formdata, setFormData] = useState([]); // Pour stocker les tâches récupérées
    const tableRef = useRef(null); // Référence au tableau HTML
    const [table, setTable] = useState(null);

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
            const newTable = new DataTable(tableRef.current, {
                destroy: true,
                data: formdata.map((item) => [
                    item.titre,
                    item.description,
                    item.datedebut,
                    item.datefin,
                    item.employee,
                    `<span class="status-${item.etat.toLowerCase().replace(' ', '-')}">${item.etat}</span>`
                ]),
                columns: [
                    { title: 'Titre' },
                    { title: 'Description' },
                    { title: 'Date Début' },
                    { title: 'Date Fin' },
                    { title: 'Assigné à' },
                    { title: 'État' }
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
        }
    }, [formdata]);

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
