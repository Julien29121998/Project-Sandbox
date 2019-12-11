const UserModel = require('../models/users.model');
const crypto = require('crypto');
/**
 * Service used to create an user in the db, return 201 and user id if succeed
 */
exports.insert = (req, res) => {
    let salt = crypto.randomBytes(16).toString('base64');
    let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
    req.body.password = salt + "$" + hash;
    if (req.body.login.length == 0) {
        res.json("Please enter a login");
    }
    UserModel.findByLogin(req.body.login).then(result=>{if (result != ""){
        res.json("This login already exists. Choose a new one!");
    }else{
        UserModel.createUser(req.body)
        .then((result2) => {
            res.status(201).send({id: result2._id});
        });
    }
    });    
};

/**
 * Service used to get a list of all users, return 200 and a list if succeed
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
    UserModel.list(limit, page)
        .then((result) => {
            res.status(200).send(result);
        })
};

/**
 * Service used to delete an user in db, return 204 if succeed
 */
exports.removeById = (req, res) => {
    UserModel.removeById(req.params.userId)
        .then((result)=>{
            res.status(204).send({});
        });
};
/**
 * Service used to update the information of an user, return 204 if succeed
 */
exports.patchById = (req, res) => {
    if (req.body.password) {
        let salt = crypto.randomBytes(16).toString('base64');
        let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
        req.body.password = salt + "$" + hash;
    }

    UserModel.patchUser(req.params.userId, req.body)
        .then((result) => {
            res.status(204).send({});
        });

};
/**
 * Service used to get the information of an user by his id, return 200 and the info if succeed
 */
exports.getById = (req, res) => {
    UserModel.findById(req.params.userId)
        .then((result) => {
            res.status(200).send(result);
        });
};