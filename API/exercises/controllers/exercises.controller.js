const ExerciseModel = require('../models/exercises.model');
const TrainingModel = require('../../trainings/models/trainings.model');
const UserModel =require('../../users/models/users.model')
const Compiler = require('../middlewares/compiler');

exports.insert = (req, res) => {
    ExerciseModel.createExercise(req.body)
        .then((result) => {
            res.status(201).send({id: result._id});
        });
};

exports.list = (req, res) => {
    let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
    let page = 0;
    if (req.query) {
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }
    }
    ExerciseModel.list(limit, page)
        .then((result) => {
            res.status(200).send(result);
        })
};

exports.getById = (req, res) => {
    ExerciseModel.findById(req.params.exerciseId)
        .then((result) => {
            res.status(200).send(result);
        });
};
exports.patchById = (req, res) => {
    ExerciseModel.patchExercise(req.params.exerciseId, req.body)
        .then((result) => {
            res.status(204).send({});
        });

};

exports.removeById = (req, res) => {
    ExerciseModel.removeById(req.params.exerciseId)
        .then((result)=>{
            res.status(204).send({});
        });
};

exports.compile = (req, res) => {
    let chosenLanguage = req.body.lang;
    let code = req.body.code;
    ExerciseModel.findById(req.params.exerciseId)
        .then((exerciseFound)=>{
            let testData=exerciseFound.testData;
            let trueCode=exerciseFound.exampleCode;
            result=Compiler.compile(code,chosenLanguage,testData,trueCode);
            res.status(200).send(result);
        });

};
exports.submit = (req, res) => {
    let userId = req.jwt.userId;
    let exerciseId = req.params.exerciseId;
    let chosenLanguage = req.body.lang;
    let code = req.body.code;
    ExerciseModel.findById(req.params.exerciseId)
        .then((exerciseFound)=>{
            let testData=exerciseFound.testData;
            let trueCode=exerciseFound.exampleCode;
            let score=Compiler.compile(code,chosenLanguage,testData,trueCode).score;
            TrainingModel.createTraining({userId: userId,exerciseId: exerciseId,date: new Date(),score: score})
                .then((resultTr) => {
                    UserModel.modifyScore(userId,score)
                    .then(()=>{
                    res.status(200).send({score: score, idTraining: resultTr._id});});
                });
        });   
};