import React, { useEffect, useState } from "react";
import keycloak from "./keycloak";
import axios from "axios";

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState({});
  const [courses, setCourses] = useState("");
  const [message, setMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    keycloak
      .init({ onLoad: "login-required" }) // Redirige vers Keycloak si pas connecté
      .then((auth) => {
        if (auth) {
          setAuthenticated(true);
          // Récupérer le profil
          keycloak.loadUserProfile().then((profile) => {
            setUserProfile(profile);
          });
          // Vérifier si Admin
          setIsAdmin(keycloak.hasRealmRole("ROLE_ADMIN"));
        }
      })
      .catch((err) => console.error("Échec auth", err));
  }, []);

  // Fonction pour appeler le backend avec le Token
  const callApi = async (method, url, data = null) => {
    try {
      const response = await axios({
        method: method,
        url: `http://localhost:8081${url}`,
        data: data,
        headers: {
          Authorization: `Bearer ${keycloak.token}`, // Ajout du token
        },
      });
      return response.data;
    } catch (error) {
        if(error.response){
             setMessage(`Erreur: ${error.response.status} - ${error.response.statusText}`);
        } else {
            setMessage("Erreur de connexion au serveur");
        }
    }
  };

  const getCourses = async () => {
    const res = await callApi("GET", "/courses");
    if(res) setCourses(JSON.stringify(res));
  };

  const addCourse = async () => {
    const res = await callApi("POST", "/courses", { name: "Nouveau Cours DevOps" });
    if(res) setMessage(res.message);
  };

  if (!authenticated) return <div>Chargement de l'authentification...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>E-Learning Platform</h1>
      
      {/* Informations Utilisateur */}
      <div style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "20px" }}>
        <h3>Profil Utilisateur</h3>
        <p>Nom: {userProfile.firstName} {userProfile.lastName}</p>
        <p>Email: {userProfile.email}</p>
        <p>Rôles: {keycloak.realmAccess?.roles.join(", ")}</p>
        <button onClick={() => keycloak.logout()}>Se déconnecter</button>
      </div>

      {/* Section Cours (Tout le monde) */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={getCourses}>Voir les cours (Student/Admin)</button>
        <pre>{courses}</pre>
      </div>

      {/* Section Admin Uniquement */}
      {isAdmin && (
        <div style={{ border: "1px solid red", padding: "10px" }}>
          <h3>Zone Admin</h3>
          <button onClick={addCourse}>Ajouter un cours (POST)</button>
        </div>
      )}

      {/* Affichage des messages / erreurs */}
      {message && <p style={{ color: "blue" }}>{message}</p>}
    </div>
  );
}

export default App;