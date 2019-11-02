const ExercisesController = require('./controllers/exercises.controller');
const PermissionMiddleware = require('../common/middlewares/auth.permission.middleware');
const ValidationMiddleware = require('../common/middlewares/auth.validation.middleware');
const config = require('../common/config/env.config');

const ADMIN = config.permissionLevels.ADMIN;
const USER = config.permissionLevels.USER;

exports.routesConfig = function (app) {
    app.post('/exercises', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
        ExercisesController.list
    ]);
    app.get('/exercises', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(USER),
        ExercisesController.list
    ]);
    app.get('/exercises/:exerciseId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(USER),
        ExercisesController.getById
    ]);
    app.patch('/exercises/:exerciseId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
        ExercisesController.patchById
    ]);
    app.delete('/exercises/:exerciseId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
        ExercisesController.removeById
    ]);
    app.post('/exercises/:exerciseId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(USER),
        ExercisesController.compile
    ]);
    app.post('/submit/:exerciseId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(USER),
        ExercisesController.submit
    ]);
};
