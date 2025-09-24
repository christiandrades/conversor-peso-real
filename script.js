const API_URL = 'https://api.wise.com/v1';
// Informe sua chave da Wise, se necessário
const API_KEY = '';

async function fetchCurrencies() {
  try {
    const response = await fetch(`${API_URL}/currencies`, {
      headers: API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {},
    });
    if (!response.ok) throw new Error('Falha ao carregar moedas');
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar moedas:', error);
    // Lista de fallback com moedas populares suportadas pela Wise
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
}

function popularMoedas(moedas) {
  const de = document.getElementById('fromCurrency');
  const para = document.getElementById('toCurrency');
  const listaOrdenada = [...moedas].sort((a, b) => a.code.localeCompare(b.code));
  listaOrdenada.forEach((m) => {
    const opt = document.createElement('option');
    opt.value = m.code;
    opt.textContent = `${m.code} - ${m.name}`;
    const opt2 = opt.cloneNode(true);
    de.appendChild(opt);
    para.appendChild(opt2);
  });
  de.value = 'CLP';
  para.value = 'BRL';
}

async function converter() {
  const valor = parseFloat(document.getElementById('amount').value);
  const de = document.getElementById('fromCurrency').value;
  const para = document.getElementById('toCurrency').value;
  if (isNaN(valor) || valor <= 0) {
    alert('Por favor, insira um valor numérico válido.');
    return;
  }
  try {
    const response = await fetch(`${API_URL}/rates?source=${de}&target=${para}`, {
      headers: API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {},
    });
    if (!response.ok) throw new Error('Falha ao obter taxa');
    const data = await response.json();
    const taxa = Array.isArray(data) ? data[0]?.rate : data.rate;
    if (!taxa) throw new Error('Taxa não encontrada');
    const convertido = (valor * taxa).toFixed(2);
    document.getElementById('result').textContent = `💰 ${convertido} ${para}`;
  } catch (error) {
    console.error('Erro na conversão:', error);
    document.getElementById('result').textContent = 'Erro ao converter.';
  }
}

async function init() {
  const moedas = await fetchCurrencies();
  popularMoedas(moedas);
  document.getElementById('convert-btn').addEventListener('click', converter);
}

document.addEventListener('DOMContentLoaded', init);
