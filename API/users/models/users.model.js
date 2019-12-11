const mongoose = require('../../common/services/mongoose.service').mongoose;
const Schema = mongoose.Schema;

const userSchema = new Schema({
    login: String,
    email: String,
    password: String,
    //For a normal coder, the permissionLevel is 3.
    //For administrator,the permissionlevel is 7
    permissionLevel: Number, 
    score: Number,
});

const User = mongoose.model('Users', userSchema);

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
userSchema.set('toJSON', {
    virtuals: true
});

userSchema.findById = function (cb) {
    return this.model('Users').find({id: this.id}, cb);
};

exports.createUser = (userData) => {
    const user = new User(userData);
    return user.save();
};

exports.findByLogin = (login) => {
    return new Promise((resolve, reject) => {
        User.find({login: login}).exec(function(err, users) {
            if (err) {
                reject(err);
            } else {
                resolve(users);
            }
        });
    });
};

exports.findById = (id) => {
    return User.findById(id)
        .then((result) => {
            result = result.toJSON();
            delete result._id;
            delete result.__v;
            return result;
        });
};


exports.list = (perPage, page) => {
    return new Promise((resolve, reject) => {
        User.find()
            .limit(perPage)
            .skip(perPage * page)
            .exec(function (err, users) {
                if (err) {
                    reject(err);
                } else {
                    resolve(users);
                }
            })
    });
};

exports.removeById = (userId) => {
    return new Promise((resolve, reject) => {
        User.remove({_id: userId}, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(err);
            }
        });
    });
};

exports.patchUser = (id, userData) => {
    return new Promise((resolve, reject) => {
        User.findById(id, function (err, user) {
            if (err) reject(err);
            for (let i in userData) {
                user[i] = userData[i];
            }
            user.save(function (err, updatedUser) {
                if (err) return reject(err);
                resolve(updatedUser);
            });
        });
    })

};

exports.modifyScore = (id, value) => {
    return new Promise((resolve, reject) => {
    User.findById(id,function(err,user){
    if (err) reject(err);
    user.score += value;
    user.save(function (err, updatedUser) {
        if (err) return reject(err);
        resolve(updatedUser);});});
});
}


