const express = require("express");
const { User, validate } = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Middleware to authenticate and verify JWT token
const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        return res.status(401).send({ message: "Access denied. Please log in to access this resource." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
        req.user = decoded; // Save user info from token to the request
        next();
    } catch (error) {
        console.error("Token verification failed:", error);
        res.status(400).send({ message: "Session expired or invalid. Please log in again." });
    }
};

// Route to get the authenticated user's details
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        res.status(200).send(user); // Send user details
    } catch (error) {
        console.error("Error in /me route:", error);
        res.status(500).send({ message: "Something went wrong. Please try again later." });
    }
});

// Route to update the authenticated user's miles driven
router.put("/update-miles", authMiddleware, async (req, res) => {
    try {
        const { milesDriven } = req.body;

        if (!milesDriven || isNaN(milesDriven)) {
            return res.status(400).send({ message: "Please provide a valid number for miles driven." });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        const currentDate = new Date();
        const lastUpdateDate = new Date(user.lastUpdate);
        const daysPassed = Math.floor((currentDate - lastUpdateDate) / (1000 * 60 * 60 * 24)); // Calculate days passed

        // Calculate the new miles to be added (based on an average per day)
        const milesPerDay = milesDriven / (365 * Math.max(currentDate.getFullYear() - user.carYear, 1));  // average miles driven per day
        const updatedMiles = user.milesDriven + milesPerDay * daysPassed;

        // Update milesDriven and lastUpdate
        user.milesDriven = updatedMiles.toFixed(2); // Fix to two decimal places
        user.lastUpdate = currentDate; // Update the lastUpdate field with current time

        await user.save();

        return res.status(200).send({ message: "Miles updated successfully", user });
    } catch (error) {
        console.error("Error in /update-miles route:", error);
        res.status(500).send({ message: "Something went wrong. Please try again later." });
    }
});

// Route to register a new user
router.post("/", async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) {
            return res.status(400).send({ message: error.details[0].message });
        }

        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(409).send({ message: "User with this email already exists" });
        }

        const salt = await bcrypt.genSalt(Number(process.env.SALT) || 10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword,
            carMake: req.body.carMake,
            carModel: req.body.carModel,
            carYear: req.body.carYear,
            milesDriven: req.body.milesDriven || 0, // Default to 0 if not provided
            lastUpdate: Date.now(), // Initialize lastUpdate to the current time
        });

        await user.save();
        res.status(201).send({ message: "User created successfully" });
    } catch (error) {
        console.error("Error in user registration:", error);
        res.status(500).send({ message: "Error while creating user" });
    }
});

module.exports = router;
