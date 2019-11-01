const TrainingsController = require('./controllers/trainings.controller');
const PermissionMiddleware = require('../common/middlewares/auth.permission.middleware');
const ValidationMiddleware = require('../common/middlewares/auth.validation.middleware');
const config = require('../common/config/env.config');

const ADMIN = config.permissionLevels.ADMIN;
const USER = config.permissionLevels.USER;

exports.routesConfig = function (app) {
    app.get('/stats/:userId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
        TrainingsController.listByUser
    ]);
    app.get('/stats/:exerciseId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
        TrainingsController.listByExercise
    ]);
    app.delete('/stats/:trainingId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
        TrainingsController.removeById
    ]);
};
