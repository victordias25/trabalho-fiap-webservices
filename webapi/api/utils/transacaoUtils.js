const databaseUtils = require('./databaseUtils')();

module.exports = () => {
  const transacaoUtils = {};

  const tiposTransacao = {
    R: 'Receita',
    D: 'Despesa'
  };

  transacaoUtils.listar = ({ incluirDesativados, nome } = {}) => {
    if (!nome) {
      incluirDesativados = Boolean(
        incluirDesativados?.toLowerCase() === 'true'
      );

        const dados = databaseUtils.listar('transacoes', incluirDesativados);

      return {
        sucesso: true,
        dados: dados
      };
    }



    const callbackFiltro = (transacao) => {
      return (
        !nome || transacao.nome.toLowerCase().includes(nome.toLowerCase())
      );
    };

    const dados = databaseUtils.listarPorFiltro({
      nomeRecurso: 'transacoes',
      callback: callbackFiltro,
    });

    return {
      sucesso: true,
      dados: dados
    };
  };

  transacaoUtils.cadastrar = (transacao) => {
    transacao.codigo = databaseUtils.gerarId();
    transacao.dataHoraCadastro = databaseUtils.retornarDataAtual();
    transacao.ativo = true;

    const validacao = databaseUtils.validarCadastro('transacoes', transacao);

    if (!validacao.ehValido) {
      return {
        sucesso: false,
        mensagem: validacao.listaErros.join(';'),
      };
    }

    const retorno = databaseUtils.cadastrar('transacoes', transacao);

    if (!retorno) {
      return {
        sucesso: false,
        mensagem: 'Ocorreu um erro ao cadastrar transação',
      };
    }

    let strTipoTransacao = tiposTransacao[transacao.tipo] ?? 'Transação';

    return {
      sucesso: true,
      mensagem: `${strTipoTransacao} cadastrada com sucesso`,
      dados: retorno,
    };
  };

  transacaoUtils.retornar = (codigo) => {
    const retorno = databaseUtils.retornar('transacoes', codigo);

    if (retorno) {
      return {
        sucesso: true,
        dados: retorno,
      };
    }

    return {
      sucesso: false,
      mensagem: 'Erro ao encontrar transação',
    };
  };

  transacaoUtils.editar = (codigo, transacao) => {
    const transacaoDatabase = transacaoUtils.retornar(codigo);

    if (!transacaoDatabase.sucesso) {
      return {
        sucesso: false,
        mensagem: 'Erro ao encontrar transação',
      };
    }

    transacao = { ...transacaoDatabase.dados[0], ...transacao };

    transacao.email = transacao.email?.toLowerCase();

    const validacao = databaseUtils.validarEdicao('transacoes', transacao);

    if (!validacao.ehValido) {
      return {
        sucesso: false,
        mensagem: validacao.listaErros.join(';'),
      };
    }

    const retorno = databaseUtils.editar('transacoes', codigo, transacao);

    let strTipoTransacao = tiposTransacao[retorno.tipo] ?? 'Transação';

    if (retorno) {
      return {
        sucesso: true,
        mensagem: `${strTipoTransacao} editada com sucesso`,
        dados: retorno,
      };
    }

    return {
      sucesso: false,
      mensagem: 'Erro ao editar transação',
    };
  };

  transacaoUtils.deletar = (codigo) => {
    const sucesso = databaseUtils.deletar('transacoes', codigo);

    return {
      sucesso: sucesso,
      mensagem: sucesso
        ? 'Transação deletada com sucesso'
        : 'Erro ao deletar transação',
    };
  };

  return transacaoUtils;
};
