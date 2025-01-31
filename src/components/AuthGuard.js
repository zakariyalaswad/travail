import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Navigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const AuthGuard = ({ children, allowedRoles = ['employee', 'responsable'] }) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Get user role from Firestore
                    const q = query(collection(db, 'users'), where('uid', '==', user.uid));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        const userData = querySnapshot.docs[0].data();
                        setUserRole(userData.role);
                        setAuthenticated(true);
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                    setAuthenticated(false);
                }
            } else {
                setAuthenticated(false);
                setUserRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>;
    }

    if (!authenticated) {
        return <Navigate to="/" replace />;
    }

    // Simplified role checking
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // If user is employee, redirect to employee dashboard
        if (userRole === 'employee') {
            return <Navigate to="/dashemployee" replace />;
        }
        // If user is responsable, redirect to responsable dashboard
        if (userRole === 'responsable') {
            return <Navigate to="/dashresponsable" replace />;
        }
        // If role is neither, redirect to error page
        return <Navigate to="/ERROR" replace />;
    }

    return children;
};

export default AuthGuard;
