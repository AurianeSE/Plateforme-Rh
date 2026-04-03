require("dotenv").config();
process.env.JWT_SECRET = process.env.JWT_SECRET || "monSecretTresSuperSecurise123";

const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/routes/authRoutes");
const employeeRoutes = require("./src/routes/employeeRoutes");  
const leaveRoutes = require("./src/routes/leaveRoutes");
const attendanceRoutes   = require("./src/routes/attendanceRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

//Middlewares globaux 
app.use(cors());
app.use(express.json()); //pour lire le JSON des requêtes

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/attendance",    attendanceRoutes);
app.use("/api/notifications", notificationRoutes);

//Routes de test
app.get("/", (req, res) => {
    res.json({ message: "API Plateforme RH opérationnelle !"});
});

//Démrrage du serveur 
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});