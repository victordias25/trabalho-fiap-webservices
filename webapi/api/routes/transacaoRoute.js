module.exports = (app) => {
  const transacaoController = require('../controllers/transacaoController')();

  app
    .route('/api/transacoes')
    .get(transacaoController.listar)
    .post(transacaoController.cadastrar);

  app
    .route('/api/transacoes/:codigo')
    .get(transacaoController.retornar)
    .patch(transacaoController.editar)
    .delete(transacaoController.deletar);
};
