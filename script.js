const API_URL = 'https://api.wise.com/v1';
// Informe sua chave da Wise, se necessário
const API_KEY = '';

const FALLBACK_CURRENCIES = [
  { code: 'AED', name: 'Dirham dos Emirados Árabes Unidos' },
  { code: 'ARS', name: 'Peso Argentino' },
  { code: 'AUD', name: 'Dólar Australiano' },
  { code: 'BGN', name: 'Lev Búlgaro' },
  { code: 'BHD', name: 'Dinar do Bahrein' },
  { code: 'BOB', name: 'Boliviano da Bolívia' },
  { code: 'BRL', name: 'Real Brasileiro' },
  { code: 'CAD', name: 'Dólar Canadense' },
  { code: 'CHF', name: 'Franco Suíço' },
  { code: 'CLP', name: 'Peso Chileno' },
  { code: 'CNY', name: 'Yuan Chinês' },
  { code: 'COP', name: 'Peso Colombiano' },
  { code: 'CRC', name: 'Colón Costarriquenho' },
  { code: 'CZK', name: 'Coroa Checa' },
  { code: 'DKK', name: 'Coroa Dinamarquesa' },
  { code: 'DOP', name: 'Peso Dominicano' },
  { code: 'EGP', name: 'Libra Egípcia' },
  { code: 'EUR', name: 'Euro' },
  { code: 'FJD', name: 'Dólar Fijiano' },
  { code: 'GBP', name: 'Libra Esterlina' },
  { code: 'GEL', name: 'Lari Georgiano' },
  { code: 'GHS', name: 'Cedi Ganês' },
  { code: 'HKD', name: 'Dólar de Hong Kong' },
  { code: 'HRK', name: 'Kuna Croata' },
  { code: 'HUF', name: 'Forint Húngaro' },
  { code: 'IDR', name: 'Rupia Indonésia' },
  { code: 'ILS', name: 'Novo Shekel Israelense' },
  { code: 'INR', name: 'Rupia Indiana' },
  { code: 'ISK', name: 'Coroa Islandesa' },
  { code: 'JMD', name: 'Dólar Jamaicano' },
  { code: 'JPY', name: 'Iene Japonês' },
  { code: 'KES', name: 'Xelim Queniano' },
  { code: 'KRW', name: 'Won Sul-Coreano' },
  { code: 'KWD', name: 'Dinar Kuwaitiano' },
  { code: 'LKR', name: 'Rupia do Sri Lanka' },
  { code: 'MAD', name: 'Dirham Marroquino' },
  { code: 'MXN', name: 'Peso Mexicano' },
  { code: 'MYR', name: 'Ringgit Malaio' },
  { code: 'NGN', name: 'Naira Nigeriana' },
  { code: 'NOK', name: 'Coroa Norueguesa' },
  { code: 'NZD', name: 'Dólar Neozelandês' },
  { code: 'OMR', name: 'Rial Omanense' },
  { code: 'PEN', name: 'Sol Peruano' },
  { code: 'PHP', name: 'Peso Filipino' },
  { code: 'PLN', name: 'Zloty Polonês' },
  { code: 'PYG', name: 'Guarani Paraguaio' },
  { code: 'QAR', name: 'Rial Catarense' },
  { code: 'RON', name: 'Leu Romeno' },
  { code: 'RSD', name: 'Dinar Sérvio' },
  { code: 'SAR', name: 'Rial Saudita' },
  { code: 'SEK', name: 'Coroa Sueca' },
  { code: 'SGD', name: 'Dólar de Singapura' },
  { code: 'THB', name: 'Baht Tailandês' },
  { code: 'TND', name: 'Dinar Tunisiano' },
  { code: 'TRY', name: 'Lira Turca' },
  { code: 'TWD', name: 'Novo Dólar Taiwanês' },
  { code: 'UAH', name: 'Hryvnia Ucraniana' },
  { code: 'USD', name: 'Dólar Americano' },
  { code: 'UYU', name: 'Peso Uruguaio' },
  { code: 'VND', name: 'Dong Vietnamita' },
  { code: 'XAF', name: 'Franco CFA da África Central' },
  { code: 'XOF', name: 'Franco CFA da África Ocidental' },
  { code: 'ZAR', name: 'Rand Sul-Africano' },
];

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
    return FALLBACK_CURRENCIES;
  }
}

function popularMoedas(moedas) {
  const de = document.getElementById('fromCurrency');
  const para = document.getElementById('toCurrency');
  const listaOrdenada = [...moedas]
    .filter((m) => m?.code && m?.name)
    .sort((a, b) => a.code.localeCompare(b.code));

  de.innerHTML = '';
  para.innerHTML = '';
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

async function obterTaxa(de, para) {
  try {
    const response = await fetch(`${API_URL}/rates?source=${de}&target=${para}`, {
      headers: API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {},
    });
    if (!response.ok) throw new Error('Falha ao obter taxa');
    const data = await response.json();
    const taxa = Array.isArray(data) ? data[0]?.rate : data.rate;
    if (!taxa) throw new Error('Taxa não encontrada');
    return taxa;
  } catch (error) {
    console.warn('Falha ao obter taxa pela Wise, tentando fallback:', error);
    const params = new URLSearchParams({ from: de, to: para });
    const fallbackResponse = await fetch(
      `https://api.exchangerate.host/convert?${params.toString()}`
    );
    if (!fallbackResponse.ok) {
      throw new Error('Falha ao obter taxa de fallback');
    }
    const fallbackData = await fallbackResponse.json();
    const taxaFallback = fallbackData?.info?.rate;
    if (!taxaFallback) {
      throw new Error('Taxa de fallback não encontrada');
    }
    return taxaFallback;
  }
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
    const taxa = await obterTaxa(de, para);
    const convertido = (valor * taxa).toFixed(2);
    document.getElementById('result').textContent = `💰 ${convertido} ${para}`;
  } catch (error) {
    console.error('Erro na conversão:', error);
    document.getElementById('result').textContent =
      'Erro ao converter. Tente novamente mais tarde.';
  }
}

async function init() {
  const moedas = await fetchCurrencies();
  popularMoedas(moedas);
  document.getElementById('convert-btn').addEventListener('click', converter);
}

if (typeof document !== 'undefined' && document?.addEventListener) {
  document.addEventListener('DOMContentLoaded', init);
}

if (typeof module !== 'undefined') {
  module.exports = {
    fetchCurrencies,
    popularMoedas,
    obterTaxa,
    converter,
    init,
    FALLBACK_CURRENCIES,
  };
}
