const mongoose = require('../../common/services/mongoose.service').mongoose;
const Schema = mongoose.Schema;

const trainingSchema = new Schema({
    userId: String,
    exerciseId: String,
    date: String,
    score: Number
});

const Training = mongoose.model('Trainings', trainingSchema);

trainingSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
trainingSchema.set('toJSON', {
    virtuals: true
});

trainingSchema.findById = function (cb) {
    return this.model('Trainings').find({id: this.id}, cb);
};


exports.findByUser = (uId,perPage, page) => {
    return new Promise((resolve, reject) => {
        Training.find({userId: uId})
            .limit(perPage)
            .skip(perPage * page)
            .exec(function (err, trainings) {
                if (err) {
                    reject(err);
                } else {
                    resolve(trainings);
                }
            })
    });
};
exports.findByExercise = (eId,perPage, page) => {
    return new Promise((resolve, reject) => {
        Training.find({exerciseId: eId})
            .limit(perPage)
            .skip(perPage * page)
            .exec(function (err, trainings) {
                if (err) {
                    reject(err);
                } else {
                    resolve(trainings);
                }
            })
    });
};

exports.findById = (id) => {
    return Training.findById(id)
        .then((result) => {
            result = result.toJSON();
            delete result._id;
            delete result.__v;
            return result;
        });
};

exports.createTraining = (trainingData) => {
    const training = new Training(trainingData);
    return training.save();
};

exports.list = (perPage, page) => {
    return new Promise((resolve, reject) => {
        Training.find()
            .limit(perPage)
            .skip(perPage * page)
            .exec(function (err, trainings) {
                if (err) {
                    reject(err);
                } else {
                    resolve(trainings);
                }
            })
    });
};

exports.patchTraining = (id, trainingData) => {
    return new Promise((resolve, reject) => {
        Training.findById(id, function (err, training) {
            if (err) reject(err);
            for (let i in trainingData) {
                training[i] = trainingData[i];
            }
            training.save(function (err, updatedTraining) {
                if (err) return reject(err);
                resolve(updatedTraining);
            });
        });
    })

};

exports.removeById = (trainingId) => {
    return new Promise((resolve, reject) => {
        Training.remove({_id: trainingId}, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(err);
            }
        });
    });
};

