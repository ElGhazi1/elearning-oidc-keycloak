# Rapport Technique : Sécurisation d’une Application E-Learning avec OAuth2 et OpenID Connect

## Introduction
Ce projet s'inscrit dans le cadre de la mise en place d'une architecture de sécurité moderne pour une plateforme universitaire de E-Learning. L'objectif principal est d'assurer l'authentification centralisée (SSO) et la gestion des autorisations via le protocole **OAuth2** et sa couche d'identification **OpenID Connect (OIDC)**.

L'architecture repose sur trois composants majeurs :
1.  **Keycloak** : Serveur de gestion des identités et des accès (IAM).
2.  **Spring Boot** : Backend API agissant comme *Resource Server*.
3.  **React** : Frontend agissant comme *Client* public.

## Sommaire
1.  Architecture du Projet
2.  Configuration du Serveur d'Identité (Keycloak)
3.  Implémentation du Backend (Spring Boot)
4.  Implémentation du Frontend (React)
5.  Démonstration et Captures
6.  Conclusion
7.  Webographie

---

## 1. Architecture du Projet
L'architecture logicielle suit le modèle standard OAuth2 :
* **Authorization Server (Keycloak)** : Gère les utilisateurs, les rôles et délivre les jetons JWT (Access Token, ID Token, Refresh Token).
* **Resource Server (Spring Boot)** : Expose une API REST sécurisée qui valide la signature des jetons JWT via l'Issuer Keycloak.
* **Client (React)** : Application Single Page (SPA) qui redirige l'utilisateur vers Keycloak pour l'authentification et stocke le jeton pour les requêtes API.

---

## 2. Configuration du Serveur d'Identité (Keycloak)

### 2.1 Configuration du Realm et du Client
* **Realm** : Création d'un espace dédié nommé `elearning-realm`.
* **Client ID** : `react-client`.
* **Type de Client** : Public (car l'application SPA ne peut pas stocker de secret client de manière sécurisée).
* **Flux (Flow)** : Standard Flow (Authorization Code Flow).
* **Redirect URI** : `http://localhost:3000/*` pour autoriser les retours vers l'application React après authentification.

### 2.2 Gestion des Rôles et Utilisateurs
Deux rôles principaux ont été définis pour la ségrégation des tâches :
* `ROLE_ADMIN` : Accès complet (lecture et écriture).
* `ROLE_STUDENT` : Accès en lecture seule.

Utilisateurs de test créés :
* `admin1` (rôle : ADMIN)
* `user1` (rôle : STUDENT)

---

## 3. Implémentation du Backend (Spring Boot)

Le backend est une application Java Spring Boot configurée en tant que *OAuth2 Resource Server*.

### 3.1 Dépendances
* `spring-boot-starter-web`
* `spring-boot-starter-security`
* `spring-boot-starter-oauth2-resource-server`

### 3.2 Configuration de la Sécurité
La classe `SecurityConfig` définit la chaîne de filtres de sécurité. Le validateur de JWT a été configuré pour interpréter les rôles fournis par Keycloak et les mapper en autorités Spring Security.

Règles d'accès (RBAC) :
* `GET /courses` : Autorisé pour **ADMIN** et **STUDENT**.
* `POST /courses` : Strictement réservé à **ADMIN**.
* `GET /me` : Retourne les informations du profil utilisateur connecté.

Les annotations `@PreAuthorize` ont été utilisées dans les contrôleurs pour sécuriser les méthodes spécifiques.

---

## 4. Implémentation du Frontend (React)

Le frontend est développé avec React et utilise la librairie `keycloak-js` pour l'interaction avec le serveur OIDC.

### 4.1 Intégration OIDC
* Initialisation de l'adaptateur Keycloak au démarrage de l'application.
* Gestion automatique du rafraîchissement du token (Silent Refresh).

### 4.2 Sécurisation des Vues
L'interface s'adapte dynamiquement selon les rôles contenus dans le token :
* La section "Gestion des cours" (ajout/modification) n'est visible que si l'utilisateur possède le rôle `ROLE_ADMIN`.
* Les informations de l'utilisateur (Nom, Email) sont extraites du endpoint `/userinfo` ou du ID Token.

### 4.3 Communication API
Un intercepteur HTTP a été configuré pour injecter le header `Authorization: Bearer <token>` dans chaque requête sortante vers le backend Spring Boot.

---

## 5. Démonstration et Captures

Les captures d'écran validant le fonctionnement du système sont disponibles dans le dossier `/screens` de ce dépôt.

Éléments validés :
1.  **Démarrage des services** : Keycloak (Docker), Backend (Tomcat 8081), Frontend (Node 3000).
2.  **Flux de redirection** : Redirection automatique vers la page de login Keycloak.
3.  **Authentification** : Connexion réussie en tant que Admin et Student.
4.  **Contrôle d'accès** :
    * Affichage de la liste des cours (Succès).
    * Tentative d'ajout de cours par un Student (403 Forbidden).
    * Ajout de cours par un Admin (200 OK).

---

## 6. Conclusion
Ce travail pratique a permis de mettre en œuvre une chaîne de sécurité complète basée sur les standards de l'industrie (OAuth2/OIDC). L'externalisation de l'authentification vers Keycloak permet de décharger les applications métiers (Spring/React) de la gestion complexe des mots de passe et des sessions, tout en garantissant une granularité fine des droits d'accès.

## 7. Webographie
* Documentation officielle Keycloak : https://www.keycloak.org/documentation
* Spring Security OAuth2 Resource Server : https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/index.html
* Keycloak JS Adapter : https://www.npmjs.com/package/keycloak-js