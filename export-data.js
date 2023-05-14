
// Load env variables into process.env
require("dotenv").config();

const mongoose = require('mongoose');
const entrepriseModel = require('./models/entreprise');
const entrepriseResultModel = require('./models/entrepriseResult');
const fs = require('fs');

// Database Connexion
mongoose.connect(process.env.DATABASE_URL)
    .then((res) => {
        console.log('Connected to Mongo Database');
        export_data();
    }
    )
    .catch((err) => console.log(err))


function export_data() {
    let rawdata = fs.readFileSync("./tkt_mock_data.json");
    let entreprises = JSON.parse(rawdata); 
    
    entreprises.forEach(entreprise => {
        const { results, ...entrepriseInfo } = entreprise;
        const entrepriseDoc = new entrepriseModel(entrepriseInfo);
    
        entrepriseDoc.save().then((entrepriseDoc) => {
            console.log(`Entreprise ${entrepriseDoc.siren} exported succesfully`);
            results.forEach(result => {
                const entrepriseResult = new entrepriseResultModel({
                    ...result,
                    entreprise_siren: entrepriseDoc.siren
                });  
                entrepriseResult.save();   
                console.log(`Result ${entrepriseResult.year} of Entreprise ${entrepriseDoc.siren} exported succesfully`);
            });
        });
    });    
}




