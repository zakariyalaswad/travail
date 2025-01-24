import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import navigate from 'navigate';
function AjouteTache(){
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
        employee: ''
    });
    const [employees, setEmployees] = useState([]);

    const getEmployees = async () => {
        const q = query(collection(db, 'users'), where('role', '==', 'employee'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => doc.data());
        setEmployees(data); 
    };

    useEffect(() => {
        getEmployees();
    }, []);
        

    const handleChange = (e) => {
        const { id, value } = e.target;
        setformdata(prevState => ({
            ...prevState,
            [id]: value
        }));
    };

    const signOut = () => {

    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingAdd(true);
        setMessage({ text: '', type: '' });
        const datedebut = new Date(formdata.datedebut);
        const datefin = new Date(formdata.datefin);
        const currentdate = new Date();
        if (datedebut > datefin) {
            setMessage({ text: 'La date de debut doit etre inferieur à la date de fin', type: 'error' });
            setLoadingAdd(false);
            return;
        } else if (currentdate < datedebut) {
            formdata.etat = "A faire";
        } else if (currentdate >= datedebut && currentdate <= datefin) {
            formdata.etat = "En cour";
        } else if (currentdate > datefin) {
            formdata.etat = "Terminée";
        }
        try {
            const docRef = await addDoc(collection(db, 'taches'),formdata);
            console.log("Document written with ID: ", docRef.id);
            setMessage({ text: 'Tache ajoutée avec succès', type: 'success' });
            setformdata({
                titre: '',
                description: '',
                datedebut: '',
                datefin: '',
                employee: ''
            });
        } catch (e) {
            console.error("Error adding document: ", e);
            setMessage({ text: 'Erreur lors de l\'ajout de la tache', type: 'error' });
        } finally {
            setLoadingAdd(false);
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
                                <Link className="nav-link" to="/dashresponsable"><i className="bi bi-house"></i>Home</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/Tache">Tache</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link active" aria-current="page" to="/AjouteTache">Nouvelle Tache</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/employee">Employee</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/Chat">Chat</Link>
                            </li>
                            <li>
                                <Link className="nav-link btn btn-danger" to="/" onClick={() => {
                                    signOut();
                                    navigate('/', { replace: true });
                                }}>Log Out</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <form onSubmit={handleSubmit}>
                <h1>Nouvelle Tache</h1>
                <div className="container">
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
                    <select id="employee" className="form-control" value={formdata.employee} onChange={handleChange} required>
                        <option value=''>Selectionner un employee</option>
                        <hr/>
                        {employees.map(employee => (
                            <option key={employee.id} value={employee.id}>{employee.nom} {employee.prenom}</option>
                        ))} 
                        </select>
                    <br/>
                    <br/>
                    <button type='submit'>Ajouter</button>
                </div>
            </form>
            

        </div>
    );
};
export default AjouteTache;