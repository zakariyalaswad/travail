import './App.css';
import React, { useState } from 'react';
import { collection, getDocs, query, where, setDoc, doc, Timestamp } from "firebase/firestore";
import { db } from './firebase';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
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

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
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
      <form onSubmit={isLogin ? handleLogin : handleSignup}>
        <fieldset>
          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="nom">Nom</label>  
                <input
                  type="text"
                  id="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required={!isLogin}
                />
              </div>

              <div className="form-group">
                <label htmlFor="prenom">Prénom</label>
                <input
                  type="text"
                  id="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required={!isLogin}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="tel">Téléphone</label>
                <input
                  type="tel"
                  id="tel"
                  value={formData.tel}
                  onChange={handleChange}
                  required={!isLogin}
                />
              </div>

              <div className="form-group">
                <label htmlFor="adresse">Adresse</label>
                <textarea
                  id="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  required={!isLogin}
                ></textarea>
              </div>
            </>
          )}

          <button type="submit" disabled={loading}>
            {isLogin ? 'Se connecter' : "S'inscrire"}
          </button>
        </fieldset>
      </form>
    </div>
  );
}

export default App;