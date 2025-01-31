import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function Error() {
    const [redirectPath, setRedirectPath] = useState('/');
    const [message, setMessage] = useState('');
    const auth = getAuth();

    useEffect(() => {
        const checkUserRole = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const q = query(collection(db, 'users'), where('uid', '==', user.uid));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        const userData = querySnapshot.docs[0].data();
                        if (userData.role === 'employee') {
                            setRedirectPath('/dashemployee');
                            setMessage("Accès refusé. Vous n'avez pas les permissions nécessaires pour accéder à cette page.");
                        } else if (userData.role === 'responsable') {
                            setRedirectPath('/dashresponsable');
                            setMessage("Cette page n'existe pas ou n'est pas accessible.");
                        }
                    }
                } catch (error) {
                    console.error("Error checking user role:", error);
                    setMessage("Une erreur s'est produite lors de la vérification des autorisations.");
                }
            }
        };

        checkUserRole();
    }, [auth]);

    return (
        <div className="error-page">
            <div className="error-content">
                <div className="error-icon">
                    <i className="bi bi-exclamation-triangle"></i>
                </div>
                <h1>Erreur 403</h1>
                <h3>{message || "Accès refusé"}</h3>
                <Link to={redirectPath} className="back-link">
                    <i className="bi bi-arrow-left"></i> Retour au tableau de bord
                </Link>
            </div>
        </div>
    );
}

export default Error;