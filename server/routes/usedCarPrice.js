const express = require("express");
const router = express.Router();

// Utility to calculate depreciation based on age, condition, and luxury status
const calculateDepreciation = (newPrice, age, condition, isLuxury, mileage) => {
    let depreciationRate = 0.15; // Basic 15% depreciation per year

    // Adjust depreciation rate based on car condition
    let conditionFactor = 1; // Default factor for condition
    if (condition === "Excellent") {
        conditionFactor = 1.1; // 10% more value for Excellent condition
    } else if (condition === "Fair") {
        conditionFactor = 0.85; // 15% less value for Fair condition
    } else if (condition === "Poor") {
        conditionFactor = 0.75; // 25% less value for Poor condition
    }

    // Adjust for luxury cars (slower depreciation for luxury cars)
    let luxuryFactor = isLuxury ? 0.95 : 1; // Luxury cars lose value more slowly

    // Adjust for mileage (less mileage means higher value)
    let mileageFactor = 1 - (mileage / 200000); // Assuming 200,000 km as high mileage threshold

    // Ensure that mileageFactor doesn't go below 0.5 for cars with excessive mileage
    mileageFactor = Math.max(mileageFactor, 0.5);

    // Apply depreciation calculation with all factors
    const depreciation = newPrice * Math.pow(1 - depreciationRate, age);
    const estimatedPrice = depreciation * conditionFactor * mileageFactor * luxuryFactor;

    return estimatedPrice;
};

// Route to estimate used car price
router.post("/estimate-used-car-price", (req, res) => {
    const { newPrice, age, mileage, condition, isLuxury } = req.body;

    // Validate input
    if (isNaN(newPrice) || isNaN(age) || isNaN(mileage) || !condition || typeof isLuxury !== "boolean") {
        return res.status(400).send({ message: "Invalid input. All fields are required and must be valid." });
    }

    // Ensure newPrice, age, mileage are valid numbers
    if (newPrice <= 0 || age < 0 || mileage < 0) {
        return res.status(400).send({ message: "Price, age, and mileage must be positive values." });
    }

    try {
        // Calculate depreciation based on input
        const estimatedPrice = calculateDepreciation(newPrice, age, condition, isLuxury, mileage);

        // Ensure the estimated price doesn't drop below 0
        const finalPrice = Math.max(estimatedPrice, 0);

        // Return the estimated price
        res.status(200).send({ estimatedPrice: finalPrice.toFixed(2) });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).send({ message: "An error occurred while calculating the used car price." });
    }
});

module.exports = router;
