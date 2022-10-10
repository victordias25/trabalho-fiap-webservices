const transacaoUtils = require('../utils/transacaoUtils')();

module.exports = () => {
  const transacaoController = {};

  transacaoController.listar = (req, res) => {
    const retorno = transacaoUtils.listar(req.query);
    if (retorno.sucesso) {
      return res.status(201).json(retorno);
    }

    return res.status(400).json(retorno);
  };

  transacaoController.cadastrar = (req, res) => {
    const retorno = transacaoUtils.cadastrar(req.body);

    if (retorno.sucesso) {
      return res.status(201).json(retorno);
    }

    return res.status(400).json(retorno);
  };

  transacaoController.retornar = (req, res) => {
    const retorno = transacaoUtils.retornar(req.params.codigo);

    if (retorno.sucesso) {
      return res.status(200).json(retorno);
    }

    return res.status(400).json(retorno);
  };

  transacaoController.retornarSaldo = (req, res) => {
    const listaTransacoes = transacaoUtils.listar().dados;

    const filtrarReceitas = (transacao) => transacao.tipo === 'R';
    const filtrarDespesas = (transacao) => transacao.tipo === 'D';

    const somarValores = (acc, transacao) => {
      return acc + transacao.valor;
    };

    const totalReceitas = listaTransacoes
      .filter(filtrarReceitas)
      .reduce(somarValores, 0);

    const totalDespesas = listaTransacoes
      .filter(filtrarDespesas)
      .reduce(somarValores, 0);

    const saldoTotal = totalReceitas - totalDespesas;

    const dados = {
      totalReceitas,
      totalDespesas,
      saldoTotal,
    };

    const retorno = {
      sucesso: true,
      dados: dados
    };

    if (retorno.sucesso) {
      return res.status(200).json(retorno);
    }

    return res.status(400).json(retorno);
  };

  transacaoController.editar = (req, res) => {
    const retorno = transacaoUtils.editar(req.params.codigo, req.body);

    if (retorno.sucesso) {
      return res.status(200).json(retorno);
    }

    return res.status(400).json(retorno);
  };

  transacaoController.deletar = (req, res) => {
    const retorno = transacaoUtils.deletar(req.params.codigo);

    if (retorno.sucesso) {
      return res.status(204).json(retorno);
    }

    return res.status(400).json(retorno);
  };

  return transacaoController;
};
