require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connection = require("./db");
const UserRoutes = require("./routes/users");
const AuthRoutes = require("./routes/auth");
const { User } = require("./models/user");
const path = require('path');
const diyRoutes = require('./routes/diy'); // Import the diyRoutes file

const app = express();

// Connect to the database
connection();

// Middleware
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",  // Ensure this matches your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

// Routes
app.use("/api/users", UserRoutes);
app.use("/api/auth", AuthRoutes);
app.use("/", diyRoutes);  // Add this line to use the diyRoutes

// Static folder for local videos
app.use('/videos', express.static(path.join(__dirname, 'videos')));
app.use('/', require('./routes/diy'));

// Test API Route
app.get("/", (req, res) => res.send("API is running..."));

// Get all users (test route)
app.get("/getUsers", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: err.message });
    }
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
