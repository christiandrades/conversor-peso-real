const FAWAZ_BASE = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1';
const FAWAZ_MIRROR = 'https://latest.currency-api.pages.dev/v1';
const FRANKFURTER_URL = 'https://api.frankfurter.app';

async function fetchCurrencies() {
  const urls = [
    `${FAWAZ_BASE}/currencies.json`,
    `${FAWAZ_MIRROR}/currencies.json`,
  ];
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const data = await response.json();
      return Object.entries(data)
        .map(([code, name]) => ({ code: code.toUpperCase(), name }))
        .sort((a, b) => a.code.localeCompare(b.code));
    } catch { /* tenta próxima */ }
  }
  console.warn('APIs de moedas indisponíveis, usando lista local.');
  return [
    { code: 'AED', name: 'Dirham dos Emirados Árabes Unidos' },
    { code: 'ARS', name: 'Peso Argentino' },
    { code: 'AUD', name: 'Dólar Australiano' },
    { code: 'BRL', name: 'Real Brasileiro' },
    { code: 'CAD', name: 'Dólar Canadense' },
    { code: 'CHF', name: 'Franco Suíço' },
    { code: 'CLP', name: 'Peso Chileno' },
    { code: 'CNY', name: 'Yuan Chinês' },
    { code: 'COP', name: 'Peso Colombiano' },
    { code: 'CZK', name: 'Coroa Checa' },
    { code: 'DKK', name: 'Coroa Dinamarquesa' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'Libra Esterlina' },
    { code: 'HKD', name: 'Dólar de Hong Kong' },
    { code: 'HUF', name: 'Forint Húngaro' },
    { code: 'ILS', name: 'Novo Shekel Israelense' },
    { code: 'INR', name: 'Rupia Indiana' },
    { code: 'JPY', name: 'Iene Japonês' },
    { code: 'MXN', name: 'Peso Mexicano' },
    { code: 'NOK', name: 'Coroa Norueguesa' },
    { code: 'NZD', name: 'Dólar Neozelandês' },
    { code: 'PEN', name: 'Sol Peruano' },
    { code: 'PLN', name: 'Zloty Polonês' },
    { code: 'RON', name: 'Leu Romeno' },
    { code: 'SEK', name: 'Coroa Sueca' },
    { code: 'SGD', name: 'Dólar de Singapura' },
    { code: 'THB', name: 'Baht Tailandês' },
    { code: 'TRY', name: 'Lira Turca' },
    { code: 'USD', name: 'Dólar Americano' },
    { code: 'UYU', name: 'Peso Uruguaio' },
    { code: 'ZAR', name: 'Rand Sul-Africano' },
  ];
}

function popularMoedas(moedas) {
  const de = document.getElementById('fromCurrency');
  const para = document.getElementById('toCurrency');
  moedas.forEach((m) => {
    const opt = document.createElement('option');
    opt.value = m.code;
    opt.textContent = `${m.code} - ${m.name}`;
    de.appendChild(opt);
    para.appendChild(opt.cloneNode(true));
  });
  de.value = 'CLP';
  para.value = 'BRL';
}

async function obterTaxa(de, para) {
  const baseLower = de.toLowerCase();
  const targetLower = para.toLowerCase();

  // Tenta fawazahmed0 (suporta 170+ moedas, incluindo CLP, ARS, etc.)
  const fawazUrls = [
    `${FAWAZ_BASE}/currencies/${baseLower}.json`,
    `${FAWAZ_MIRROR}/currencies/${baseLower}.json`,
  ];
  for (const url of fawazUrls) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const data = await response.json();
      const taxa = data[baseLower]?.[targetLower];
      if (taxa) return taxa;
    } catch { /* tenta próxima */ }
  }

  // Fallback: Frankfurter (taxas do BCE, ~33 moedas principais)
  try {
    const response = await fetch(`${FRANKFURTER_URL}/latest?from=${de}&to=${para}`);
    if (response.ok) {
      const data = await response.json();
      const taxa = data.rates?.[para];
      if (taxa) return taxa;
    }
  } catch { /* ignora */ }

  throw new Error('Não foi possível obter a taxa de câmbio.');
}

const HISTORICO_KEY = 'conversor_historico';
const HISTORICO_MAX = 10;

function salvarHistorico(de, para, valor, convertido, taxa) {
  const historico = JSON.parse(localStorage.getItem(HISTORICO_KEY) || '[]');
  historico.unshift({
    de,
    para,
    valor,
    convertido,
    taxa,
    data: new Date().toLocaleString('pt-BR'),
  });
  if (historico.length > HISTORICO_MAX) historico.length = HISTORICO_MAX;
  localStorage.setItem(HISTORICO_KEY, JSON.stringify(historico));
  renderizarHistorico(historico);
}

function renderizarHistorico(historico) {
  const lista = document.getElementById('historico-lista');
  if (!lista) return;
  lista.innerHTML = '';
  if (historico.length === 0) {
    lista.innerHTML = '<li class="historico-vazio">Nenhuma conversão realizada.</li>';
    return;
  }
  historico.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = `${item.valor} ${item.de} → ${item.convertido} ${item.para} (taxa: ${item.taxa.toFixed(4)}) — ${item.data}`;
    lista.appendChild(li);
  });
}

function limparHistorico() {
  localStorage.removeItem(HISTORICO_KEY);
  renderizarHistorico([]);
}

async function converter() {
  const valor = parseFloat(document.getElementById('amount').value);
  const de = document.getElementById('fromCurrency').value;
  const para = document.getElementById('toCurrency').value;
  if (isNaN(valor) || valor <= 0) {
    alert('Por favor, insira um valor numérico válido.');
    return;
  }
  const btn = document.getElementById('convert-btn');
  btn.disabled = true;
  btn.textContent = 'Convertendo…';
  try {
    const taxa = await obterTaxa(de, para);
    const convertido = (valor * taxa).toFixed(2);
    document.getElementById('result').textContent = `💰 ${convertido} ${para}`;
    salvarHistorico(de, para, valor, convertido, taxa);
  } catch (error) {
    console.error('Erro na conversão:', error);
    document.getElementById('result').textContent =
      'Erro ao converter. Verifique sua conexão e tente novamente.';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Converter';
  }
}

async function init() {
  const moedas = await fetchCurrencies();
  popularMoedas(moedas);
  document.getElementById('convert-btn').addEventListener('click', converter);
  document.getElementById('limpar-historico')?.addEventListener('click', limparHistorico);
  const historicoSalvo = JSON.parse(localStorage.getItem(HISTORICO_KEY) || '[]');
  renderizarHistorico(historicoSalvo);
}

document.addEventListener('DOMContentLoaded', init);
