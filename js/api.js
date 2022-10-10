const apiUrl = 'http://localhost:3000/api';

export default function createApi() {
  const api = {};

  api.listarTransacoes = () => {
    return fetch(`${apiUrl}/transacoes`, {
      method: 'GET',
      //mode: 'no-cors',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }
      console.error('Erro ao realizar fetch', response);
    });
  };

  api.cadastrarTransacao = ({ nome, valor, tipo, data }) => {
    return fetch(`${apiUrl}/transacoes`, {
      method: 'POST',
      //mode: 'no-cors',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        nome,
        valor,
        tipo,
        dataTransacao: data,
      }),
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }
      console.error('Erro ao realizar fetch', response);
    });
  };

  api.atualizarTransacao = ({ codigo, nome, valor, tipo, data }) => {
    return fetch(`${apiUrl}/transacoes/${codigo}`, {
      method: 'PATCH',
      //mode: 'no-cors',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        nome,
        valor,
        tipo,
        dataTransacao: data,
      }),
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }
      console.error('Erro ao realizar fetch', response);
    });
  };

  api.deletarTransacao = ({ codigo }) => {
    return fetch(`${apiUrl}/transacoes/${codigo}`, {
      method: 'DELETE',
      //mode: 'no-cors',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        codigo,
      }),
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }
      console.error('Erro ao realizar fetch', response);
    });
  };

  api.retornarTransacaoID = ({ codigo }) => {
    return fetch(`${apiUrl}/transacoes/${codigo}`, {
        method: 'GET',
        //mode: 'no-cors',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }).then((response) => {
        if (response.ok) {
          return response.json();
        }
        console.error('Erro ao realizar fetch', response);
      });
  };

  api.retornarSaldo = () => {
    return fetch(`${apiUrl}/saldo`, {
        method: 'GET',
        //mode: 'no-cors',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }).then((response) => {
        if (response.ok) {
          return response.json();
        }
        console.error('Erro ao realizar fetch', response);
      });
  };

  

  return api;
}
