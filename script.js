// Controle de abas
const tabs = document.querySelectorAll('nav button');
const sections = document.querySelectorAll('main .tab');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    sections.forEach(s => s.classList.remove('active'));

    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// Cálculo automático da idade pelo campo dataNascimento
const form = document.getElementById('formCadastro');
const dataNascimentoInput = form.elements['dataNascimento'];
const idadeInput = form.elements['idade'];

dataNascimentoInput.addEventListener('change', () => {
  const dataNasc = new Date(dataNascimentoInput.value);
  if (!isNaN(dataNasc.getTime())) {
    const idade = calcularIdade(dataNasc);
    idadeInput.value = idade;
  } else {
    idadeInput.value = '';
  }
});

function calcularIdade(dataNasc) {
  const hoje = new Date();
  let idade = hoje.getFullYear() - dataNasc.getFullYear();
  const m = hoje.getMonth() - dataNasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < dataNasc.getDate())) {
    idade--;
  }
  return idade;
}

// Armazenar cadastros localmente
let cadastros = JSON.parse(localStorage.getItem('cadastros')) || [];

// Geração de QR Code - vamos usar biblioteca QRCode.js
// Por limitações, vou incluir QRCode.js via CDN
const scriptQRCode = document.createElement('script');
scriptQRCode.src = 'https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js';
document.head.appendChild(scriptQRCode);

scriptQRCode.onload = () => {
  // Após carregar QRCode.js, adiciona funcionalidade no cadastro
  form.addEventListener('submit', e => {
    e.preventDefault();

    const novoCadastro = {
      id: Date.now(),
      nome: form.elements['nome'].value.trim(),
      dataNascimento: form.elements['dataNascimento'].value,
      idade: form.elements['idade'].value,
      telefone: form.elements['telefone'].value.trim(),
      email: form.elements['email'].value.trim(),
      entrada: null,
      saida: null,
    };

    // Salvar
    cadastros.push(novoCadastro);
    localStorage.setItem('cadastros', JSON.stringify(cadastros));

    gerarQRCode(novoCadastro.id);

    alert('Cadastro realizado com sucesso!');

    form.reset();
    idadeInput.value = '';
  });

  function gerarQRCode(id) {
    const cadastro = cadastros.find(c => c.id === id);
    const qrDiv = document.getElementById('qrCodeCadastro');
    qrDiv.innerHTML = ''; // limpa

    // Vamos codificar só o ID para ser usado na leitura depois
    QRCode.toCanvas(
      id.toString(),
      { width: 150 },
      (error, canvas) => {
        if (error) {
          console.error(error);
          qrDiv.textContent = 'Erro ao gerar QR Code.';
          return;
        }
        qrDiv.appendChild(canvas);
      }
    );
  }
};

// Busca por nome
const inputBusca = document.getElementById('inputBusca');
const listaBusca = document.getElementById('listaBusca');

inputBusca.addEventListener('input', () => {
  const termo = inputBusca.value.toLowerCase();
  listaBusca.innerHTML = '';

  if (termo.length < 2) return;

  const resultados = cadastros.filter(c => c.nome.toLowerCase().includes(termo));

  resultados.forEach(c => {
    const li = document.createElement('li');
    li.textContent = `${c.nome} - ${c.idade} anos`;
    listaBusca.appendChild(li);
  });
});

// Histórico simples mostrando cadastros
const listaHistorico = document.getElementById('listaHistorico');
function atualizarHistorico() {
  listaHistorico.innerHTML = '';
  if (cadastros.length === 0) {
    listaHistorico.textContent = 'Nenhum cadastro ainda.';
    return;
  }
  cadastros.forEach(c => {
    const li = document.createElement('li');
    li.textContent = `${c.nome} - Nascido em ${c.dataNascimento} - ${c.idade} anos`;
    listaHistorico.appendChild(li);
  });
}
// Atualiza ao iniciar
atualizarHistorico();

// Impressão
const btnImprimir = document.getElementById('btnImprimir');
const conteudoImpressao = document.getElementById('conteudoImpressao');

btnImprimir.addEventListener('click', () => {
  if (cadastros.length === 0) {
    alert('Nenhum cadastro para imprimir.');
    return;
  }
  let html = '<h2>Lista de Cadastros</h2><ul>';
  cadastros.forEach(c => {
    html += `<li>${c.nome} - ${c.idade} anos - Tel: ${c.telefone} - Email: ${c.email}</li>`;
  });
  html += '</ul>';

  conteudoImpressao.innerHTML = html;

  window.print();
});

// TODO: Integração com câmera para registrar entrada e saída, leitura QR Code para validar entrada/saída, marketing dinâmico
