const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    // 1. Récupérer le token dans header Authorization
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Accès refusé. Token manquant."});
    }

    const token = authHeader.split(" ")[1];

    try {
        // 2. Vérifier et décoder le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // on attache l'user à la requête
        next(); // on passe à la suite 
    } catch (error) {
        res.status(401).json({ message: "Token invalide ou expiré"});
    }
};

// Middleware pour vérifier le rôle
const requireRole = (role) => (req, res, next) => {
    if(req.user.role !== role) {
        return res.status(403).json({ message: "Accès interdit."});
    }
    next();
};

module.exports = { protect, requireRole };