const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    carMake: { type: String, required: true },
    carModel: { type: String, required: true },
    carYear: { type: Number, required: true },
    milesDriven: { type: Number, required: true },
    lastUpdate: { type: Date, default: Date.now },  // This ensures `lastUpdate` is set to the current date when a new user is created
});

userSchema.methods.generateAuthTokens = function () {
    const token = jwt.sign(
        { _id: this._id }, // Payload
        process.env.JWTPRIVATEKEY, // Secret key from .env
        { expiresIn: "7d" } // Options
    );
    return token;
};

const User = mongoose.model("User", userSchema);

const validate = (data) => {
    const schema = Joi.object({
        firstName: Joi.string().required().label("First Name"),
        lastName: Joi.string().required().label("Last Name"),
        email: Joi.string().email().required().label("Email"),
        password: passwordComplexity().required().label("Password"),
        carMake: Joi.string().required().label("Car Make"),
        carModel: Joi.string().required().label("Car Model"),
        carYear: Joi.number().integer().min(1886).max(new Date().getFullYear()).required().label("Car Year"),
        milesDriven: Joi.number().integer().min(0).required().label("Miles Driven"),
    });
    return schema.validate(data);
};

module.exports = { User, validate };
