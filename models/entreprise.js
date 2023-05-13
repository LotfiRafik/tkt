const mongoose = require('mongoose');
   
// @TODO 
const entrepriseResultSchema = mongoose.Schema({
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
            required: true
        },
        ebitda: {
            type: Number,
            required: true
        },
        loss: {
            type: Number,
            required: true
        },
    },
    {
        timestamps: true
    }
);

// @TODO replace mongodb builtIn ID with custom ID (siren)
const entrepriseSchema = mongoose.Schema({
    siren: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    // @TODO migrate sectors to another collection
    sector: {
        type: String,
    },
    results: [entrepriseResultSchema],
}, 
{
    timestamps: true
}
);

// Indexes
entrepriseSchema.index({ siren: 1}, { unique: true});

module.exports = mongoose.model('entreprise', entrepriseSchema);