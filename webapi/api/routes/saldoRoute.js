module.exports = (app) => {
  const transacaoController = require('../controllers/transacaoController')();

  app
    .route('/api/saldo')
    .get(transacaoController.retornarSaldo);
};
