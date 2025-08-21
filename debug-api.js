// Script de debug pour tester l'API backend avec authentification
const API_BASE = "https://showroom-backend-2x3g.onrender.com";
const TEST_CREDENTIALS = {
    email: "vendeur10@example.com",
    password: "vendeur10"
};

let authToken = null;

async function login() {
    console.log("🔐 Tentative de connexion...");
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(TEST_CREDENTIALS)
        });
        
        console.log("📡 Statut de connexion:", response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Erreur de connexion:", errorText);
            return false;
        }
        
        const data = await response.json();
        authToken = data.access_token;
        
        console.log("✅ Connexion réussie!");
        console.log("🔑 Token reçu:", authToken ? `✅ Présent (${authToken.substring(0, 20)}...)` : "❌ Absent");
        
        return true;
        
    } catch (error) {
        console.error("❌ Erreur lors de la connexion:", error.message);
        return false;
    }
}

async function testAuthenticatedEndpoint() {
    if (!authToken) {
        console.error("❌ Pas de token d'authentification disponible");
        return;
    }
    
    console.log("\n🔍 Test de l'endpoint authentifié...");
    
    try {
        const response = await fetch(`${API_BASE}/products/vendor/my-products`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        console.log("📡 Statut de réponse:", response.status);
        console.log("📡 Headers:", Object.fromEntries(response.headers.entries()));
        
        const text = await response.text();
        console.log("📦 Réponse (", text.length, "caractères):");
        console.log(text.substring(0, 1000));
        
        if (response.ok) {
            try {
                const data = JSON.parse(text);
                console.log("✅ Données parsées avec succès!");
                console.log("📊 Nombre de produits:", Array.isArray(data) ? data.length : "Format non-array");
            } catch (parseError) {
                console.error("❌ Erreur de parsing JSON:", parseError.message);
            }
        } else {
            console.error(`❌ Erreur API: ${response.status}`);
        }
        
    } catch (error) {
        console.error("❌ Erreur de connexion:", error.message);
    }
}

async function testUserInfo() {
    if (!authToken) {
        console.error("❌ Pas de token d'authentification disponible");
        return;
    }
    
    console.log("\n🔍 Test des informations utilisateur...");
    
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        console.log("📡 Statut auth/me:", response.status);
        
        if (response.ok) {
            const userData = await response.json();
            console.log("✅ Informations utilisateur récupérées:");
            console.log("👤 ID:", userData.id);
            console.log("📧 Email:", userData.email);
            console.log("🏷️ Rôle:", userData.role);
            console.log("📊 Données complètes:", userData);
        } else {
            const errorText = await response.text();
            console.error("❌ Erreur auth/me:", errorText);
        }
        
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des infos utilisateur:", error.message);
    }
}

async function testAPI() {
    console.log("🚀 Début des tests API avec authentification");
    console.log("=" .repeat(50));
    
    // Étape 1: Connexion
    const loginSuccess = await login();
    
    if (!loginSuccess) {
        console.error("❌ Impossible de se connecter. Arrêt des tests.");
        return;
    }
    
    // Étape 2: Test des informations utilisateur
    await testUserInfo();
    
    // Étape 3: Test de l'endpoint des produits
    await testAuthenticatedEndpoint();
    
    console.log("\n" + "=" .repeat(50));
    console.log("🏁 Tests terminés");
}

// Lancer les tests
testAPI();
