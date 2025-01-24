import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc,deleteDoc} from 'firebase/firestore';
import { db } from '../firebase';
import navigate from 'navigate';
function Employer(){
    const auth = getAuth();
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
    const handleDelete = async (uid) => {
        try {
            const q = query(collection(db, 'users'), where('uid', '==', uid));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });
            setEmployees(employees.filter(employee => employee.uid !== uid));
        } catch (error) {
            console.error("Error deleting employee: ", error);
        }
    };
    return(
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
                                <Link className="nav-link" to="/AjouteTache">Nouvelle Tache</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link active" aria-current="page" to="/employee">Employee</Link>
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
            <section>
                <h1>Vos employés</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">Nom</th>
                        <th scope="col">Prenom</th>
                        <th scope="col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map(employee => (
                        <tr key={employee.uid}>
                            <td>{employee.nom}</td>
                            <td>{employee.prenom}</td>
                            <td>
                                <Link className="btn btn-primary" to={`/profile/${employee.uid}`}>Profil</Link>
                                <button className="btn btn-danger" onClick={() => handleDelete(employee.uid)}>Supprimer</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </section>
        </div>
    );
};
export default Employer;