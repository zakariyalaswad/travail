import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
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
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTasks = async () => {
            const q = query(collection(db, 'taches'), where('etat', '==', 'En cour'));
            const querySnapshot = await getDocs(q);
            const tasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setEmployees(tasks);
            setLoading(false);
        };

        fetchTasks();
    }, []);

    const handleEdit = (id) => {
        navigate(`/modifierTache/${id}`);
    };

    const handleDelete = async (id) => {
        await deleteDoc(doc(db, 'taches', id));
        setEmployees(employees.filter(employee => employee.id !== id));
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
            <h1>bienvenue au page responsable</h1>
            <div className='currentTache container'>
                <div className=' row col-lg-4'>
                    {employees.length > 0 ? (
                        employees.map(employee => (
                            <table className="table" key={employee.id}>
                                <tbody>
                                    <tr>
                                        <th>Titre</th>
                                        <td>{employee.titre}</td>
                                    </tr>
                                    <tr>
                                        <th>Description</th>
                                        <td>{employee.description}</td>
                                    </tr>
                                    <tr>
                                        <th>Date Debut</th>
                                        <td>{employee.datedebut}</td>
                                    </tr>
                                    <tr>
                                        <th>Date Fin</th>
                                        <td>{employee.datefin}</td>
                                    </tr>
                                    <tr>
                                        <th>Employee</th>
                                        <td>{employee.employee}</td>
                                    </tr>
                                    <tr>
                                        <th>Actions</th>
                                        <td>
                                            <button className="btn btn-primary" onClick={() => handleEdit(employee.id)}>Modifier</button>
                                            <button className="btn btn-danger" onClick={() => handleDelete(employee.id)}>Supprimer</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        ))
                    ) : (
                        <p>No tasks en cour</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashResponsable;
