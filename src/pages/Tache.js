import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Assure-toi que ta configuration Firebase est bien importée
import DataTable from 'datatables.net-dt'; // Import DataTables

function Tache() {
    const [formdata, setFormData] = useState([]); // Pour stocker les tâches récupérées
    const tableRef = useRef(null); // Référence au tableau HTML

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

    // Initialiser DataTables après avoir les données
    useEffect(() => {
        if (formdata.length > 0) {
            // Créer le tableau interactif avec DataTables
            const table = new DataTable(tableRef.current, {
                data: formdata.map((item) => [
                    item.titre,        // Colonne 1 : Titre de la tâche
                    item.description,  // Colonne 2 : Description
                    item.datedebut,    // Colonne 3 : Date de début
                    item.datefin,      // Colonne 4 : Date de fin
                    item.employee,     // Colonne 5 : Employé assigné
                    item.etat,         // Colonne 6 : État de la tâche
                ]),
                columns: [
                    { title: 'Titre' },
                    { title: 'Description' },
                    { title: 'Date Début' },
                    { title: 'Date Fin' },
                    { title: 'Employé' },
                    { title: 'État' },
                ],
            });

            // Nettoyer l'instance DataTables avant de recréer
            return () => {
                table.destroy();
            };
        }
    }, [formdata]);

    return (
        <div>
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg bg-body-tertiary">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#"><i className="bi bi-person-circle" title='Profil'></i></a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link" to="/dashResponsable"><i className="bi bi-house"></i> Home</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link active" aria-current="page" to="/Tache">Tâche</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/AjouteTache">Nouvelle Tâche</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Tableau des tâches */}
            <table ref={tableRef} className="display" style={{ width: '100%' }}></table>
        </div>
    );
}

export default Tache;
