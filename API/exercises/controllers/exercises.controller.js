const ExerciseModel = require('../models/exercises.model');
const TrainingModel = require('../../trainings/models/trainings.model');
const UserModel =require('../../users/models/users.model')
const Compiler = require('../middlewares/compiler');

/**
 * The service used to create an exercise.
 */
exports.insert = (req, res) => {
    ExerciseModel.createExercise(req.body)
        .then((result) => {
            res.status(201).send({id: result._id});
        });
};
/**
 * The service used to get all of the exercises.
 */
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
/**
 * The servise used to get an exercise by exerciseId passed in path.
 */
exports.getById = (req, res) => {
    ExerciseModel.findById(req.params.exerciseId)
        .then((result) => {
            res.status(200).send(result);
        });
};
/**
 * The service used to update an existing exercise.
 */
exports.patchById = (req, res) => {
    ExerciseModel.patchExercise(req.params.exerciseId, req.body)
        .then((result) => {
            res.status(204).send({});
        });

};

/**
 * The service used to delete an exercise.
 */
exports.removeById = (req, res) => {
    ExerciseModel.removeById(req.params.exerciseId)
        .then((result)=>{
            res.status(204).send({});
        });
};
/**
 * The service used when the user compiles and run his code.
 * The user code is going to be boxed in a function and deployed on OpenFaas.
 * The result returned contains score, execution time, and result.
 */
exports.compile =  (req, res) => {

    let userId = req.jwt.userId;
    let exerciseId = req.params.exerciseId;

    let chosenLanguage = req.body.lang;
    let code = req.body.code;
    ExerciseModel.findById(req.params.exerciseId)
        .then(async(exerciseFound)=>{
            let testData=exerciseFound.testData;
            let trueCode=exerciseFound.exampleCode;
            let trueCodeLang=exerciseFound.exampleCodeLang;
            let name=exerciseFound.name;
            result= await Compiler.compile(req.params.exerciseId,code,chosenLanguage,testData,trueCode,trueCodeLang,name);
            res.status(200).send(result);
        });

};
/**
 * The service used when the user submits his code. 
 * The code is going to be deloyed on OpenFaas, executed, and the user's total score will be updated. Meanwhile, a new training record is created.
 */
exports.submit = (req, res) => {
    let userId = req.jwt.userId;
    let exerciseId = req.params.exerciseId;
    let chosenLanguage = req.body.lang;
    let code = req.body.code;
    ExerciseModel.findById(req.params.exerciseId)
        .then(async (exerciseFound)=>{
            let testData=exerciseFound.testData;
            let trueCode=exerciseFound.exampleCode;
            let trueCodeLang=exerciseFound.exampleCodeLang;
            let name=exerciseFound.name;
            let result=await Compiler.compile(exerciseId,code,chosenLanguage,testData,trueCode,trueCodeLang,name);
            TrainingModel.createTraining({userId: userId,exerciseId: exerciseId,date: new Date(),score: result.score})
                .then((resultTr) => {
                    UserModel.modifyScore(userId,result.score)
                    .then(()=>{
                    res.status(200).send({score: result.score, idTraining: resultTr.id});});
                });
        });   
};