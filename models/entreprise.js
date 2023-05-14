const mongoose = require('mongoose');

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
}, 
{
    timestamps: true,
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true } // So `console.log()` and other functions that use `toObject()` include virtuals
}
);


// Specifying a virtual with a `ref` property is how you enable virtual
// population
entrepriseSchema.virtual('results', {
    ref: 'entrepriseResult',
    localField: 'siren',
    foreignField: 'entreprise_siren'
  });

// Indexes
entrepriseSchema.index({ siren: 1}, { unique: true});

module.exports = mongoose.model('entreprise', entrepriseSchema);