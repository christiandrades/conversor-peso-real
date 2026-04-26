const CURRENCIES = [
  { code: 'AED', name: 'Dirham dos Emirados Árabes Unidos' },
  { code: 'ARS', name: 'Peso Argentino' },
  { code: 'AUD', name: 'Dólar Australiano' },
  { code: 'BRL', name: 'Real Brasileiro' },
  { code: 'BOB', name: 'Boliviano' },
  { code: 'CAD', name: 'Dólar Canadense' },
  { code: 'CHF', name: 'Franco Suíço' },
  { code: 'CLP', name: 'Peso Chileno' },
  { code: 'CNY', name: 'Yuan Chinês' },
  { code: 'COP', name: 'Peso Colombiano' },
  { code: 'CZK', name: 'Coroa Checa' },
  { code: 'DKK', name: 'Coroa Dinamarquesa' },
  { code: 'DOP', name: 'Peso Dominicano' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'Libra Esterlina' },
  { code: 'GTQ', name: 'Quetzal Guatemalteco' },
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
  { code: 'PYG', name: 'Guarani Paraguaio' },
  { code: 'RON', name: 'Leu Romeno' },
  { code: 'SEK', name: 'Coroa Sueca' },
  { code: 'SGD', name: 'Dólar de Singapura' },
  { code: 'THB', name: 'Baht Tailandês' },
  { code: 'TRY', name: 'Lira Turca' },
  { code: 'USD', name: 'Dólar Americano' },
  { code: 'UYU', name: 'Peso Uruguaio' },
  { code: 'VES', name: 'Bolívar Venezuelano' },
  { code: 'ZAR', name: 'Rand Sul-Africano' },
];

function popularMoedas() {
  const de = document.getElementById('fromCurrency');
  const para = document.getElementById('toCurrency');
  const listaOrdenada = [...CURRENCIES].sort((a, b) => a.code.localeCompare(b.code));
  listaOrdenada.forEach((m) => {
    const opt = document.createElement('option');
    opt.value = m.code;
    opt.textContent = `${m.code} - ${m.name}`;
    de.appendChild(opt);
    para.appendChild(opt.cloneNode(true));
  });
  de.value = 'CLP';
  para.value = 'BRL';
}

const CACHE_TTL = 30 * 60 * 1000;

function getCachedRate(de, para) {
  try {
    const cached = localStorage.getItem(`rate_${de}_${para}`);
    if (!cached) return null;
    const { rate, ts } = JSON.parse(cached);
    if (Date.now() - ts > CACHE_TTL) {
      localStorage.removeItem(`rate_${de}_${para}`);
      return null;
    }
    return rate;
  } catch {
    return null;
  }
}

function setCachedRate(de, para, rate) {
  try {
    localStorage.setItem(`rate_${de}_${para}`, JSON.stringify({ rate, ts: Date.now() }));
  } catch {}
}

async function obterTaxa(de, para) {
  const cached = getCachedRate(de, para);
  if (cached !== null) return cached;

  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${de}`);
    if (!res.ok) throw new Error('open.er-api falhou');
    const data = await res.json();
    if (data.result !== 'success') throw new Error('resposta inválida');
    const taxa = data.rates[para];
    if (!taxa) throw new Error('moeda não encontrada');
    setCachedRate(de, para, taxa);
    return taxa;
  } catch (e) {
    console.warn('Usando fallback:', e.message);
  }

  const res = await fetch(
    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${de.toLowerCase()}.min.json`
  );
  if (!res.ok) throw new Error('Falha ao obter taxa de câmbio');
  const data = await res.json();
  const taxa = data[de.toLowerCase()]?.[para.toLowerCase()];
  if (!taxa) throw new Error('Taxa não encontrada');
  setCachedRate(de, para, taxa);
  return taxa;
}

async function converter() {
  const valor = parseFloat(document.getElementById('amount').value);
  const de = document.getElementById('fromCurrency').value;
  const para = document.getElementById('toCurrency').value;
  const resultEl = document.getElementById('result');
  const btn = document.getElementById('convert-btn');

  if (isNaN(valor) || valor <= 0) {
    resultEl.textContent = 'Por favor, insira um valor numérico válido.';
    resultEl.style.color = '#c0392b';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Convertendo...';
  resultEl.textContent = '';
  resultEl.style.color = '';

  const rateEl = document.getElementById('rate-info');

  try {
    const taxa = await obterTaxa(de, para);
    const convertido = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor * taxa);
    resultEl.textContent = `💰 ${convertido} ${para}`;
    resultEl.style.color = '#27ae60';
    rateEl.textContent = `Taxa: 1 ${de} = ${taxa.toFixed(6)} ${para}`;
  } catch (error) {
    console.error(error);
    resultEl.textContent = 'Erro ao obter taxa de câmbio. Tente novamente.';
    resultEl.style.color = '#c0392b';
    rateEl.textContent = '';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Converter';
  }
}

function trocarMoedas() {
  const de = document.getElementById('fromCurrency');
  const para = document.getElementById('toCurrency');
  [de.value, para.value] = [para.value, de.value];
}

function init() {
  popularMoedas();
  document.getElementById('convert-btn').addEventListener('click', converter);
  document.getElementById('swap-btn').addEventListener('click', trocarMoedas);
  document.getElementById('amount').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') converter();
  });
}

document.addEventListener('DOMContentLoaded', init);
