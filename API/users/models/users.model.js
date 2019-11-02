const mongoose = require('../../common/services/mongoose.service').mongoose;
const Schema = mongoose.Schema;

const userSchema = new Schema({
    login: String,
    email: String,
    password: String,
    admin: Boolean, 
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
    return User.find({login: login});
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



