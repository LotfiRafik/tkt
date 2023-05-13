const express = require('express');
const router = express.Router();

const entrepriseModel = require('../models/entreprise');

/*
    Get entreprise(s)
*/
router.get('/', async (req, res, next) => {

    const beginIdx = req.query.skip ? parseInt(req.query.skip) : 0;
    const endIdx = req.query.limit ? parseInt(req.query.limit) + beginIdx : undefined;
    // must be valid json strings
    const sort = req.query.sort ? JSON.parse(req.query.sort) : {createdAt: -1};
    const query = JSON.parse(req.query.query) || {};

    try {
        const entreprises = await entrepriseModel.find(query).sort(sort).exec();
        // Pagination
        const paginatedEntreprises = entreprises.slice(beginIdx, endIdx)
                                                    
        return res.json({
            results: paginatedEntreprises,
            count: paginatedEntreprises.length,
            totalCount: entreprises.length,
        });

    } catch (err) {
        return res.status(500).json({ message: err.message});
    }
});

/*
    Create entreprise
*/
router.post('/', async (req, res, next) => {
    // @TODO validate client data
    
    const entrepriseDocument = new entrepriseModel(req.body);
    try {
        const newEntrepriseDocument = await entrepriseDocument.save();
        return res.status(201).json(newEntrepriseDocument);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
});

/*
    Delete entreprise
*/
router.delete('/:entrepriseId', async (req, res, next) => {
    // @TODO validate client data
    try {
        await entrepriseModel.deleteOne({_id: req.params.entrepriseId});
        return res.status(200).json();
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
});


/*
    Create entreprise
*/
router.post('/:entrepriseId/result', async (req, res, next) => {
    // @TODO validate client data
    // Check year uniquenes
    
    try {
        const entrepriseDoc = await entrepriseModel.findById(req.params.entrepriseId)
        entrepriseDoc.results.push(req.body);
        await entrepriseDoc.save(); 

        return res.status(200).json(entrepriseDoc);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
});



/*
    Get entreprise(s)
*/
router.get('/:entrepriseId/compare-results/', async (req, res, next) => {

    const year1 = parseInt(req.query.year1);
    const year2 = parseInt(req.query.year2);
    const results = {}

    try {
        const entreprise = await entrepriseModel.findById(req.params.entrepriseId).exec();
        // get the two years results
        entreprise.results.forEach(result => {
            if(result.year === year1 || result.year === year2){
                results[result.year] = result;
            }
        });

        if(!results[year1] || !results[year2]){
            return res.status(400).json({
                error: `some year results are missing`,
                results: results
            })
        }

        results.diff = {
            ca: results[year1].ca - results[year2].ca
        }

        return res.json({
            entreprise,
            results,
        });

    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: err.message});
    }
});



module.exports = router;