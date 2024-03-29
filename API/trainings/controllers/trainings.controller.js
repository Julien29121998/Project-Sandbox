const TrainingModel = require('../models/trainings.model');
/**
 * Service used to get all of the training records of a user,
 * it returns a list of training records.
 */
exports.listByUser = (req, res) => {
    let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
    let page = 0;
    if (req.query) {
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }
    }
    TrainingModel.findByUser(req.params.userId,limit, page)
        .then((result) => {
            res.status(200).send(result);
        })
};
/**
 * Service used to get all of the training recor
 */
exports.listByExercise = (req, res) => {
    let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
    let page = 1;
    if (req.query) {
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }
    }
    TrainingModel.findByExercise(req.params.exerciseId,limit, page)
        .then((result) => {
            res.status(200).send(result);
        })
};

exports.getById = (req, res) => {
    TrainingModel.findById(req.params.trainingId)
        .then((result) => {
            res.status(200).send(result);
        });
};


exports.removeById = (req, res) => {
    TrainingModel.removeById(req.params.trainingId)
        .then((result)=>{
            res.status(204).send({});
        });
};
