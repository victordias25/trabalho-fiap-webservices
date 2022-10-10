module.exports = (app) => {
  const defaultController = require('../controllers/defaultController')();

  app
    .route('/api')
    .get(defaultController.health);
};
