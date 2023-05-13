// Load env variables into process.env
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const express = require("express");
const app = express();
const mongoose = require('mongoose');

// Database Connexion
mongoose.connect(process.env.DATABASE_URL)
    .then((res) => {
        console.log('Connected to Mongo Database');
        app.listen( PORT, () => {
            console.log(`server is running on port ${PORT}`);
        });
    }
    )
    .catch((err) => console.log(err))

// Global Middlewares
// parse json data
app.use(express.json());

// Entreprise Ressource routes
const entrepriseRouter = require('./routes/entreprise');
app.use('/entreprise', entrepriseRouter);