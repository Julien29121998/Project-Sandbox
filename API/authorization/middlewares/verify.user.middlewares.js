const UserModel = require('../../users/models/users.model');
const crypto = require('crypto');

exports.hasAuthValidFields = (req, res, next) => {
    let errors = [];

    if (req.body) {
        if (!req.body.login) {
            errors.push('Missing login field');
        }
        if (!req.body.password) {
            errors.push('Missing password field');
        }

        if (errors.length) {
            return res.status(400).send({errors: errors.join(',')});
        } else {
            return next();
        }
    } else {
        return res.status(400).send({errors: 'Missing login and password fields'});
    }
};

exports.isPasswordAndUserMatch = (req, res, next) => {
    UserModel.findByLogin(req.body.login)
        .then((user)=>{
            if(!user[0]){
                res.status(404).send({});
            }else{
                let passwordFields = user[0].password.split('$');
                let salt = passwordFields[0];
                let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
                if (hash === passwordFields[1]) {
                    req.body = {
                        userId: user[0]._id,
                        email: user[0].email,
                        admin: user[0].admin,
                        provider: 'email',
                        login: user[0].login,
                        score: user[0].score,
                    };
                    return next();
                } else {
                    return res.status(400).send({errors: ['Invalid login or password']});
                }
            }
        });
};