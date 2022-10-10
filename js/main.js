import createApi from './api.js';

$('.valor-transacao').maskMoney({
  prefix: "R$ ",
  decimal: ",",
  thousands: "."
})

const api = createApi();

function formatarDinheiro(valorFloat) {
  if (!valorFloat && valorFloat !== 0)
    return console.error(`Valor ${valorFloat} não é válido para ser formatado`);

  return valorFloat.toLocaleString('pt-br', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatarData(strData) {
  if (!strData)
    return console.error(`Data ${strData} não é válida para ser formatada`);

  // Formato de entrada esperado para a data yyyy-MM-dd ou yyyyMMdd
  strData = strData.replaceAll('-', '');

  if (strData.length !== 8)
    return console.error(`Data ${strData} não está em um formato válido`);

  try {
    const strAno = strData.substring(0, 4);
    const strMes = strData.substring(4, 6);
    const strDia = strData.substring(6, 8);

    return `${strDia}/${strMes}/${strAno}`;
  } catch (err) {
    console.error(`Erro: ${err}`);
  }
}

async function renderizarListaTransacoes() {
  const dataTransacoes = await api.listarTransacoes();

  if (!dataTransacoes.sucesso) {
    console.error('Erro ao retornar lista de transacoes');
  }

  const tabelaBody = document.querySelector('.tabela-transacoes-body');
  tabelaBody.innerHTML = '';

  dataTransacoes.dados.forEach((transacao) => {
    const trTransacao = document.createElement('tr');

    const tdNome = document.createElement('td');
    tdNome.innerText = transacao.nome;
    trTransacao.appendChild(tdNome);

    const tdValor = document.createElement('td');
    const valorFormatado = formatarDinheiro(transacao.valor);
    if (transacao.tipo === 'D') {
      tdValor.innerText = `- ${valorFormatado}`;
      tdValor.classList.add('transacao-despesa');
    } else {
      tdValor.innerText = `${valorFormatado}`;
      tdValor.classList.add('transacao-receita');
    }
    trTransacao.appendChild(tdValor);

    const tdData = document.createElement('td');
    tdData.innerText = formatarData(transacao.dataTransacao);
    trTransacao.appendChild(tdData);

    const tdAcoes = document.createElement('td');
    tdAcoes.innerHTML = `
    <span class="editar-transacao" data-codigo="${transacao.codigo}" >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        class="bi bi-pencil-square"
        viewBox="0 0 16 16"
      >
        <path
          d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"
        />
        <path
          fill-rule="evenodd"
          d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
        />
      </svg>
    </span>
    <span class="excluir-transacao" data-codigo="${transacao.codigo}">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        class="bi bi-trash3-fill"
        viewBox="0 0 16 16"
      >
        <path
          d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z"
        />
      </svg>
    </span>`;
    trTransacao.appendChild(tdAcoes);

    tabelaBody.appendChild(trTransacao);
  });
}

async function atualizarSaldo(){
  const dataSaldo = await api.retornarSaldo();

  if(!dataSaldo.sucesso) 
    return console.error("Erro ao retornar saldo")

    const spanSaldoTotal = document.querySelector(".saldo-total");
    const spanTotalDespesas = document.querySelector(".total-despesas");
    const spanTotalReceitas = document.querySelector(".total-receitas");

    if (dataSaldo.dados.saldoTotal < 0) {
      $('.saldo-total').addClass('red');
    }

    spanSaldoTotal.innerText = formatarDinheiro(dataSaldo.dados.saldoTotal);
    spanTotalDespesas.innerText = `- ${formatarDinheiro(dataSaldo.dados.totalDespesas)}`;
    spanTotalReceitas.innerText = formatarDinheiro(dataSaldo.dados.totalReceitas);
    
    
}

renderizarListaTransacoes();

atualizarSaldo();

const btnCadastrarTransacao = document.querySelector('.btn-cadastrar-transacao');

btnCadastrarTransacao.addEventListener('click', async () => {
  
  const valor_string = document.querySelector('.valor-transacao').value.replaceAll('R$','').replaceAll(' ','').replaceAll('.','').replaceAll(',','.');
  const nome = document.querySelector('.nome-transacao').value;
  const valor = Number(valor_string);
  const tipo = document.querySelector('.tipo-transacao').value;
  const data = document.querySelector('.data-transacao').value;

  api.cadastrarTransacao({nome, valor, tipo, data}).then((res) => {
    console.log(res);
    const btnFecharModal = document.querySelector('.btn-fechar-modal');

    btnFecharModal.dispatchEvent(new MouseEvent('click', {view: window, bubbles: true, cancelable: true}))
  }).catch(err => {
    console.error(err)
  })
});


$(".table").on('click','.excluir-transacao',function(){
  const codigo = this.getAttribute('data-codigo');
  api.deletarTransacao({codigo}).then((res) => {
    console.log(res);
  }).catch(err => {
    console.error(err)
  })
});

$(".table").on('click','.editar-transacao',async function(){
  const codigo = this.getAttribute('data-codigo');
  $('#editarTransacao').modal('show');
  const dataTransacoes = await api.retornarTransacaoID({codigo});
  if (!dataTransacoes.sucesso) {
    console.error('Erro ao retornar lista de transacoes');
  }

  console.log(formatarDinheiro(dataTransacoes.dados[0].valor))
  document.querySelector('.edit-form .valor-transacao').value = formatarDinheiro(dataTransacoes.dados[0].valor)
  document.querySelector('.edit-form .nome-transacao').value = formatarDinheiro(dataTransacoes.dados[0].nome)
  document.querySelector('.edit-form .tipo-transacao').value = formatarDinheiro(dataTransacoes.dados[0].tipo)
  document.querySelector('.edit-form .data-transacao').value = formatarDinheiro(dataTransacoes.dados[0].dataTransacao)
  document.querySelector('.edit-form .codigo-transacao').value = formatarDinheiro(dataTransacoes.dados[0].codigo)

});

const btnEditarTransacao = document.querySelector('.btn-editar-transacao');

btnEditarTransacao.addEventListener('click', async () => {
  const valor_string = document.querySelector('.edit-form .valor-transacao').value.replaceAll('R$','').replaceAll(' ','').replaceAll('.','').replaceAll(',','.');
  const nome = document.querySelector('.edit-form .nome-transacao').value;
  const valor = Number(valor_string);
  const tipo = document.querySelector('.edit-form .tipo-transacao').value;
  const data = document.querySelector('.edit-form .data-transacao').value;
  const codigo = document.querySelector('.edit-form .codigo-transacao').value;

  console.log(codigo);

  api.atualizarTransacao({codigo, nome, valor, tipo, data}).then((res) => {
    console.log(res);
    const btnFecharModal = document.querySelector('.btn-fechar-modal');
    btnFecharModal.dispatchEvent(new MouseEvent('click', {view: window, bubbles: true, cancelable: true}))
  }).catch(err => {
    console.error(err)
  })
});
