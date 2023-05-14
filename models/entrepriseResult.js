const mongoose = require('mongoose');
   
const entrepriseResultSchema = mongoose.Schema({
    entreprise_siren: {
        type: Number,
        required: true      
    },
    year: {
        type: Number,
        required: true
    },
    ca: {
        type: Number,
        required: true
    },
    margin: {
        type: Number,
    },
    ebitda: {
        type: Number,
    },
    loss: {
        type: Number,
    },
},
{
    timestamps: true
}
);

// Indexes
entrepriseResultSchema.index({ entreprise_siren: 1, year: -1}, { unique: true});

module.exports = mongoose.model('entrepriseResult', entrepriseResultSchema);