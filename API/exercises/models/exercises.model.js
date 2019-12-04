const mongoose = require('../../common/services/mongoose.service').mongoose;
const Schema = mongoose.Schema;

const exerciseSchema = new Schema({
    name: String,
    description: String,
    exampleCode: String,
    testData: [[Schema.Types.Mixed]]
});

const Exercise = mongoose.model('Exercises', exerciseSchema);

exerciseSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
exerciseSchema.set('toJSON', {
    virtuals: true
});

exerciseSchema.findById = function (cb) {
    return this.model('Exercises').find({id: this.id}, cb);
};

exports.findById = (id) => {
    return Exercise.findById(id)
        .then((result) => {
            result = result.toJSON();
            delete result._id;
            delete result.__v;
            return result;
        });
};

exports.createExercise = (exerciseData) => {
    const exercise = new Exercise(exerciseData);
    return exercise.save();
};

exports.list = (perPage, page) => {
    return new Promise((resolve, reject) => {
        Exercise.find()
            .limit(perPage)
            .skip(perPage * page)
            .exec(function (err, exercises) {
                if (err) {
                    reject(err);
                } else {
                    resolve(exercises);
                }
            })
    });
};

exports.patchExercise = (id, exerciseData) => {
    return new Promise((resolve, reject) => {
        Exercise.findById(id, function (err, exercise) {
            if (err) reject(err);
            for (let i in exerciseData) {
                exercise[i] = exerciseData[i];
            }
            exercise.save(function (err, updatedExercise) {
                if (err) return reject(err);
                resolve(updatedExercise);
            });
        });
    })

};

exports.removeById = (exerciseId) => {
    return new Promise((resolve, reject) => {
        Exercise.remove({_id: exerciseId}, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(err);
            }
        });
    });
};

