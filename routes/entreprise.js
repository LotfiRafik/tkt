const express = require('express');
const router = express.Router();
const Joi = require('joi');

const entrepriseModel = require('../models/entreprise');
const entrepriseResultModel = require('../models/entrepriseResult');

/*
    Get entreprise(s)
*/
router.get('/', async (req, res, next) => {

    const beginIdx = req.query.skip ? parseInt(req.query.skip) : 0;
    const endIdx = req.query.limit ? parseInt(req.query.limit) + beginIdx : undefined;
    let query,sort;
    try {
        // must be valid json strings
        sort = req.query.sort ? JSON.parse(req.query.sort) : {createdAt: -1};
        query = req.query.query ? JSON.parse(req.query.query) : {};    
    } catch (error) {
        return res.status(400).json({ message: "query && sort params must be valid strignified json"});
    }

    try {
        const entreprises = await entrepriseModel.find(query).sort(sort).populate('results').exec();

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

    // @TODO move joi schema definition out of handler for better performance
    const bodySchema = Joi.object({
        siren: Joi.number().integer().required(),
        name: Joi.string().required(),
        sector: Joi.string(),
    });

    // validate client data
    const validatedBody = bodySchema.validate(req.body);
    if(validatedBody.error){
        return res.status(400).json({error: validatedBody.error.details});
    }
    
    const entrepriseDocument = new entrepriseModel(validatedBody.value);
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
router.delete('/:entrepriseSiren', async (req, res, next) => {
    // @TODO validate client data
    try {
        const result = await entrepriseModel.deleteOne({siren: req.params.entrepriseSiren});
        if(result.deletedCount != 1)
            return res.status(404).json({error: "No record found to be deleted"});

        return res.status(200).json();
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
});


/*
    Create entreprise's result
*/
router.post('/:entrepriseSiren/result', async (req, res, next) => {

    // @TODO move joi schema definition out of handler for better performance
    const bodySchema = Joi.object({
        year: Joi.number().integer().required(),
        ca: Joi.number().integer().required(),
        margin: Joi.number().integer(),
        ebitda: Joi.number().integer(),
        loss: Joi.number().integer(),
    });

    // Validate client data
    const validatedBody = bodySchema.validate(req.body);
    if(validatedBody.error){
        return res.status(400).json({error: validatedBody.error.details});
    }

    validatedBody.value.entreprise_siren = req.params.entrepriseSiren
    const entrepriseResultDocument = new entrepriseResultModel(validatedBody.value);
    try {
        const newEntrepriseResDocument = await entrepriseResultDocument.save();
        return res.status(201).json(newEntrepriseResDocument);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
});


/*
    Compare entreprise results
*/
router.get('/:entrepriseSiren/compare-results/', async (req, res, next) => {

    // @TODO move joi schema definition out of handler for better performance
    const reqQuerySchema = Joi.object({
        year1: Joi.number().integer().required(),
        year2: Joi.number().integer().required(),
    });

    // Validate client data
    const validatedReqQuery = reqQuerySchema.validate(req.query);
    if(validatedReqQuery.error){
        return res.status(400).json({error: validatedReqQuery.error.details});
    }

    const year1 = req.query.year1;
    const year2 = req.query.year2;
    const results = {}

    try {
        const entreprise = await entrepriseModel.findOne({
            siren: req.params.entrepriseSiren
        })
        .populate({
            path :"results",
            match: { $or: [ {year:year1}, {year:year2}] },
        })
        .exec();

        if(!entreprise)
            return res.status(404).json({ error: "Entreprise not found"});
            
        if(entreprise.results.length != 2){
            return res.status(404).json({
                error: `some year results are missing`,
                results: entreprise.results
            })
        }

        results[entreprise.results[0].year] = entreprise.results[0];
        results[entreprise.results[1].year] = entreprise.results[1];

        results.diff = {
            ca: results[year1].ca - results[year2].ca
        }

        return res.json({
            entreprise,
            comparaison: results,
        });

    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: err.message});
    }
});



module.exports = router;