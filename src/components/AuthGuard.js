import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Navigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const AuthGuard = ({ children, allowedRoles = ['employee', 'responsable'] }) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const auth = getAuth();

    useEffect(() => {
        const checkAuth = async (user) => {
            if (!user) {
                setAuthenticated(false);
                setUserRole(null);
                setLoading(false);
                return;
            }

            try {
                const q = query(collection(db, 'users'), where('uid', '==', user.uid));
                const querySnapshot = await getDocs(q);
                
                if (querySnapshot.empty) {
                    setAuthenticated(false);
                    setUserRole(null);
                } else {
                    const userData = querySnapshot.docs[0].data();
                    setUserRole(userData.role);
                    setAuthenticated(true);
                }
            } catch (error) {
                console.error("Error fetching user role:", error);
                setAuthenticated(false);
                setUserRole(null);
            } finally {
                setLoading(false);
            }
        };

        // Check initial auth state
        const currentUser = auth.currentUser;
        if (currentUser) {
            checkAuth(currentUser);
        }

        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, checkAuth);
        return () => unsubscribe();
    }, [auth]);

    // Show loading state
    if (loading) {
        return <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>;
    }

    // Redirect to login if not authenticated
    if (!authenticated || !auth.currentUser) {
        return <Navigate to="/" replace />;
    }

    // Role-based access control
    if (!allowedRoles.includes(userRole)) {
        if (userRole === 'employee') {
            return <Navigate to="/dashemployee" replace />;
        }
        if (userRole === 'responsable') {
            return <Navigate to="/dashresponsable" replace />;
        }
        return <Navigate to="/ERROR" replace />;
    }

    return children;
};

export default AuthGuard;
