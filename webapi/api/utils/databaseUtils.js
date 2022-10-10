const fs = require('fs');
const database = require('../data/database.json');

const databaseFreezed = database;

Object.freeze(databaseFreezed);

module.exports = () => {
  const databaseUtils = {};

  const copyFunction = function () {
    return JSON.parse(JSON.stringify(this));
  };

  Array.prototype.copy = copyFunction;

  Object.prototype.copy = copyFunction;

  const retornarAtributoAtivacao = (nomeRecurso) => {
    const listaValicacoes = Object.entries(database[nomeRecurso].validation);

    const parEncontrado = listaValicacoes.find(
      ([_, validacao]) => validacao.isActivationField === true
    );

    if (!parEncontrado) {
      return;
    }

    const [attrAtivacao, _] = parEncontrado;

    return attrAtivacao;
  };

  const retornarAtributoIdentificador = (nomeRecurso) => {
    const listaValicacoes = Object.entries(database[nomeRecurso].validation);

    const parEncontrado = listaValicacoes.find(
      ([_, validacao]) => validacao.isIdentityField === true
    );

    if (!parEncontrado) {
      return;
    }

    const [attrIdentificador, _] = parEncontrado;

    return attrIdentificador;
  };

  const salvar = () => {
    const qtdeEspacosIndentar = 4;
    const databaseSalvar = { ...databaseFreezed };

    Object.entries(database).forEach(([nomeRecurso, recurso]) => {
      databaseSalvar[nomeRecurso].data = recurso.data;
    });

    const strDatabase = JSON.stringify(
      databaseSalvar,
      null,
      qtdeEspacosIndentar
    );

    fs.writeFile('./api/data/database.json', strDatabase, (err) => {
      if (err) {
        console.log(err);
      }
    });
  };

  const retornarPorIdentificador = ({ nomeRecurso, identificador }) => {
    const attrIdentificador = retornarAtributoIdentificador(nomeRecurso);

    if (!attrIdentificador) {
      console.log(
        `Busca não permitida, pois o recurso '${nomeRecurso}' não possui nenhuma coluna de identidade`
      );
      return;
    }

    return databaseUtils
      .listar(nomeRecurso)
      .filter((recurso) => recurso[attrIdentificador] === identificador)
      .copy();
  };

  databaseUtils.listarPorFiltro = ({ nomeRecurso, callback }) => {
    return databaseUtils
      .listar(nomeRecurso)
      .filter(callback)
      .copy();
  };

  const editarPorIdentificador = ({ nomeRecurso, identificador, recurso }) => {
    const attrIdentificador = retornarAtributoIdentificador(nomeRecurso);

    if (!attrIdentificador) {
      console.log(
        `Edição não permitida, pois o recurso '${nomeRecurso}' não possui nenhuma coluna de identidade`
      );
      return;
    }

    database[nomeRecurso].data = database[nomeRecurso].data.map((item) => {
      if (item[attrIdentificador] === identificador) {
        return { ...item, ...recurso };
      }
      return item;
    });

    salvar();

    return databaseUtils
      .retornar(nomeRecurso, identificador)
      .copy();
  };

  const editarPorCallback = ({ nomeRecurso, callback, recurso }) => {
    database[nomeRecurso].data = database[nomeRecurso].data.map((item) => {
      if (callback(item)) {
        return { ...item, ...recurso };
      }
      return item;
    });

    salvar();

    return databaseUtils
      .retornar(nomeRecurso, callback)
      .copy();
  };

  const deletarPorIdentificador = ({ nomeRecurso, identificador }) => {
    const attrIdentificador = retornarAtributoIdentificador(nomeRecurso);
    const attrAtivacao = retornarAtributoAtivacao(nomeRecurso);

    if (!attrIdentificador) {
      console.log(
        `Exclusão não permitida, pois o recurso '${nomeRecurso}' não possui nenhuma coluna de identidade`
      );
      return;
    }

    let qtdeItensAlterados = 0;
    if (attrAtivacao) {
      database[nomeRecurso].data = databaseUtils
        .listar(nomeRecurso, (incluirDesativados = true))
        .map((item) => {
          if (
            item[attrIdentificador] === identificador &&
            item[attrAtivacao] === true
          ) {
            qtdeItensAlterados++;
            item[attrAtivacao] = false;
          }
          return item;
        });
    } else {
      database[nomeRecurso].data = databaseUtils
        .listar(nomeRecurso)
        .filter((item) => item[attrIdentificador] !== identificador);
    }

    salvar();

    return qtdeItensAlterados > 0;
  };

  const deletarPorCallback = ({ nomeRecurso, callback }) => {
    const attrAtivacao = retornarAtributoAtivacao(nomeRecurso);

    let qtdeItensAlterados = 0;

    if (attrAtivacao) {
      database[nomeRecurso].data = databaseUtils
        .listar(nomeRecurso, (incluirDesativados = true))
        .map((item) => {
          if (callback(item) && item[attrAtivacao] === true) {
            qtdeItensAlterados++;
            item[attrAtivacao] = false;
          }
          return item;
        });
    } else {
      database[nomeRecurso].data = databaseUtils
        .listar(nomeRecurso)
        .filter((item) => !callback(item));
    }

    salvar();

    return qtdeItensAlterados > 0;
  };

  const executarPorIdentificadorOuCallback = (
    identificador_ou_callback,
    params,
    executarPorIdentificador,
    executarPorCallback
  ) => {
    const tipoParametro = typeof identificador_ou_callback;

    const tiposIdentificador = ['number', 'string', 'bigint'];
    const ehBuscaPorIdentificador = tiposIdentificador.includes(tipoParametro);

    const tiposCallback = ['function'];
    const ehBuscaPorCallback = tiposCallback.includes(tipoParametro);

    if (ehBuscaPorIdentificador) {
      return executarPorIdentificador({
        ...params,
        identificador: identificador_ou_callback,
      });
    }

    if (ehBuscaPorCallback) {
      return executarPorCallback({
        ...params,
        callback: identificador_ou_callback,
      });
    }

    console.log(`Parâmetro de busca do tipo '${tipoParametro}' não é válido`);
    return;
  };

  const validar = (nomeRecurso, recurso, modoValidacao) => {
    const listaValicacoes = Object.entries(database[nomeRecurso].validation);
    let ehValido = true;
    let listaErros = [];

    listaValicacoes.forEach(([nomeAtributo, validacao]) => {
      const atributo = recurso[nomeAtributo];

      // Validar se o atributo aceita valor nulo
      if (validacao.nullable === false && !atributo) {
        ehValido = false;
        listaErros.push(`O atributo '${nomeAtributo}' é obrigatório`);
      }

      // Validar tipo de dado
      if (atributo && validacao.type !== undefined) {
        const tipoEnviado = typeof atributo;
        const tipoRequerido = validacao.type;
        if (tipoEnviado !== tipoRequerido) {
          ehValido = false;
          listaErros.push(
            `O atributo ${nomeAtributo}='${atributo}'(${tipoEnviado}) deve ser do tipo '${tipoRequerido}'`
          );
        }
      }

      // Validar Regex
      if (validacao.regex) {
        const regex = RegExp(validacao.regex, 'g');

        if (atributo && !atributo.match(regex)) {
          ehValido = false;
          listaErros.push(
            `O atributo ${nomeAtributo}='${atributo}' é inválido`
          );

          if (validacao.regexDescription) {
            listaErros.push(validacao.regexDescription);
          }
        }
      }

      // Validar se o atributo aceita duplicatas
      if (validacao.allowDuplicates === false) {
        const attrIdentificador = retornarAtributoIdentificador(nomeRecurso);

        if (!attrIdentificador) {
          console.log(
            `Validação não permitida, pois o recurso '${nomeRecurso}' não possui nenhuma coluna de identidade`
          );
          return;
        }

        let qtdeItensRecursoComAtributoIdentico;

        if (modoValidacao === 'edição') {
          qtdeItensRecursoComAtributoIdentico = databaseUtils
            .listar(nomeRecurso)
            .filter(
              (item) =>
                item[nomeAtributo] === atributo &&
                item[attrIdentificador] !== recurso[attrIdentificador]
            ).length;
        } else {
          qtdeItensRecursoComAtributoIdentico = databaseUtils
            .listar(nomeRecurso)
            .filter((item) => item[nomeAtributo] === atributo).length;
        }

        if (atributo && qtdeItensRecursoComAtributoIdentico > 0) {
          ehValido = false;
          listaErros.push(`${nomeAtributo} '${atributo}' já cadastrado`);
        }
      }

      // Validar se o atributo segue o enum pré-definido
      if (
        Array.isArray(validacao.enum) &&
        atributo &&
        !validacao.enum.includes(atributo)
      ) {
        ehValido = false;
        const valoresValidos = validacao.enum
          .map((valor) => `'${valor}'`)
          .join(',');
        listaErros.push(
          `O atributo '${nomeAtributo}' aceita apenas os seguintes valores: ${valoresValidos}`
        );
      }
    });

    return { ehValido, listaErros };
  };

  databaseUtils.retornarDataAtual = () => {
    // Recupera horário UTC
    let agora = new Date();
    // Aplica fuso-horário de Brasília
    const fusoHorarioBrasilia = -3;
    agora.setHours(agora.getHours() + fusoHorarioBrasilia);
    // Ajusta formato para ficar 'yyyy-mm-dd HH:mm:ss'
    return agora.toJSON().replace('T', ' ').replace('Z', '');
  };

  databaseUtils.gerarId = () => {
    const S4 = () => {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4();
  };

  databaseUtils.listar = (nomeRecurso, incluirDesativados = false) => {
    const attrAtivacao = retornarAtributoAtivacao(nomeRecurso);
    if (incluirDesativados) {
      return database[nomeRecurso].data
      .copy();
    }

    return database[nomeRecurso].data
      .filter((recurso) => !attrAtivacao || recurso[attrAtivacao] === true)
      .copy();
  };

  databaseUtils.retornar = (nomeRecurso, identificador_ou_callback) => {
    return executarPorIdentificadorOuCallback(
      identificador_ou_callback,
      { nomeRecurso, identificador_ou_callback },
      retornarPorIdentificador,
      databaseUtils.listarPorFiltro
    );
  };

  databaseUtils.cadastrar = (nomeRecurso, recurso) => {
    database[nomeRecurso].data.push(recurso);
    salvar();
    return recurso;
  };

  databaseUtils.editar = (nomeRecurso, identificador_ou_callback, recurso) => {
    return executarPorIdentificadorOuCallback(
      identificador_ou_callback,
      { nomeRecurso, identificador_ou_callback, recurso },
      editarPorIdentificador,
      editarPorCallback
    );
  };

  databaseUtils.deletar = (nomeRecurso, identificador_ou_callback) => {
    return executarPorIdentificadorOuCallback(
      identificador_ou_callback,
      { nomeRecurso, identificador_ou_callback },
      deletarPorIdentificador,
      deletarPorCallback
    );
  };

  databaseUtils.validarCadastro = (nomeRecurso, recurso) => {
    return validar(nomeRecurso, recurso, 'cadastro');
  };

  databaseUtils.validarEdicao = (nomeRecurso, recurso) => {
    return validar(nomeRecurso, recurso, 'edição');
  };

  return databaseUtils;
};
