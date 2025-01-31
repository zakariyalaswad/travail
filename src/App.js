import './App.css';
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, setDoc, doc, Timestamp } from "firebase/firestore";
import { db } from './firebase';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { SpeedInsights } from "@vercel/speed-insights/react"

function App() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    tel: '',
    adresse: ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const q = query(collection(db, 'users'), where('uid', '==', user.uid));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            if (userData.role === 'employee') {
              navigate('/dashemployee');
            } else if (userData.role === 'responsable') {
              navigate('/dashresponsable');
            }
          }
        } catch (error) {
          console.error("Error checking user role:", error);
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value) return 'Email est requis';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Format email invalide';
        return '';
      case 'password':
        if (!value) return 'Mot de passe est requis';
        if (value.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères';
        return '';
      case 'nom':
        if (!value) return 'Nom est requis';
        if (value.length < 2) return 'Le nom doit contenir au moins 2 caractères';
        return '';
      case 'prenom':
        if (!value) return 'Prénom est requis';
        if (value.length < 2) return 'Le prénom doit contenir au moins 2 caractères';
        return '';
      case 'tel':
        if (!value) return 'Téléphone est requis';
        if (!/^[0-9+\s-]{8,}$/.test(value)) return 'Format téléphone invalide';
        return '';
      case 'adresse':
        if (!value) return 'Adresse est requise';
        if (value.length < 10) return 'Adresse trop courte';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
    // Validate immediately on change
    setErrors(prev => ({
      ...prev,
      [id]: validateField(id, value)
    }));
    // Mark field as touched on first input
    if (!touched[id]) {
      setTouched(prev => ({
        ...prev,
        [id]: true
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate all fields before submission
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (!isLogin || (key === 'email' || key === 'password')) {
        newErrors[key] = validateField(key, formData[key]);
      }
    });
    setErrors(newErrors);
    setTouched(Object.keys(formData).reduce((acc, key) => ({
      ...acc,
      [key]: true
    }), {}));

    // Check if there are any errors
    if (Object.values(newErrors).some(error => error !== '')) {
      return;
    }

    // Proceed with login or signup
    if (isLogin) {
      handleLogin(e);
    } else {
      handleSignup(e);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setLoading(true);

    const auth = getAuth();
    try {
      const dashUser = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const uidac = dashUser.user.uid;
      const q = query(collection(db, 'users'), where('uid', '==', uidac));

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        if (userData.role === 'employee') {
          setMessage({ text: 'Connexion réussie!', type: 'success' });
          navigate('/dashemployee');
        } else if (userData.role === 'responsable') {
          setMessage({ text: 'Connexion réussie!', type: 'success' });
          navigate('/dashresponsable');
        } else {
          setMessage({ text: 'Role non reconnu', type: 'error' });
        }
      } else {
        setMessage({ text: "Aucun utilisateur trouvé avec cet UID", type: 'error' });
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      setMessage({ text: 'Email ou mot de passe incorrect', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setLoading(true);

    const auth = getAuth();
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", formData.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setMessage({ text: 'Cet email existe déjà', type: 'error' });
        setLoading(false);
        return;
      }

      const userId = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const uid = userId.user.uid;
      let user = { ...formData };
      delete user.password;
      user.role = "employee";
      user.uid = uid;
      const date = new Date();
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      user.dateCreated = `${day}-${month}-${year}`;
      await setDoc(doc(db, "users", uid), user);
      setMessage({ text: 'Compte créé avec succès!', type: 'success' });

      setFormData({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        tel: '',
        adresse: ''
      });
      console.log("User created with ID: ", uid);
    } catch (error) {
      setMessage({ text: "Erreur lors de l'inscription", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="auth-buttons">
        <button 
          className={`toggle-btn ${isLogin ? 'active' : ''}`}
          onClick={() => setIsLogin(true)}
        >
          Connexion
        </button>
        <button 
          className={`toggle-btn ${!isLogin ? 'active' : ''}`}
          onClick={() => setIsLogin(false)}
        >
          Inscription
        </button>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {loading && <div className="loading">Chargement...</div>}
      <form onSubmit={handleSubmit} noValidate>
        <fieldset>
          {!isLogin && (
            <>
              <div className={`form-group ${errors.nom ? 'error' : ''}`}>
                <label htmlFor="nom">Nom</label>  
                <input
                  type="text"
                  id="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className={errors.nom ? 'error' : ''}
                />
                {errors.nom && <span className="error-message">{errors.nom}</span>}
              </div>

              <div className={`form-group ${errors.prenom ? 'error' : ''}`}></div>
                <label htmlFor="prenom">Prénom</label>
                <input
                  type="text"
                  id="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  className={errors.prenom ? 'error' : ''}
                />
                {errors.prenom && <span className="error-message">{errors.prenom}</span>}
            </>
          )}

          <div className={`form-group ${errors.email ? 'error' : ''}`}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className={`form-group ${errors.password ? 'error' : ''}`}>
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {!isLogin && (
            <>
              <div className={`form-group ${errors.tel ? 'error' : ''}`}>
                <label htmlFor="tel">Téléphone</label>
                <input
                  type="tel"
                  id="tel"
                  value={formData.tel}
                  onChange={handleChange}
                  className={errors.tel ? 'error' : ''}
                />
                {errors.tel && <span className="error-message">{errors.tel}</span>}
              </div>

              <div className={`form-group ${errors.adresse ? 'error' : ''}`}>
                <label htmlFor="adresse">Adresse</label>
                <textarea
                  id="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  className={errors.adresse ? 'error' : ''}
                ></textarea>
                {errors.adresse && <span className="error-message">{errors.adresse}</span>}
              </div>
            </>
          )}
          <button type="submit" disabled={loading || (!isLogin && Object.keys(errors).some(key => errors[key]))}>{isLogin ? 'Se connecter' : "S'inscrire"}</button>
        </fieldset>
      </form>
    </div>
  );
}

export default App;