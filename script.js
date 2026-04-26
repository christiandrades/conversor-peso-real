const CURRENCIES = [
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

async function obterTaxa(de, para) {
  // Primary: open.er-api.com (free, no key, supports all currencies)
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${de}`);
    if (!res.ok) throw new Error('open.er-api falhou');
    const data = await res.json();
    if (data.result !== 'success') throw new Error('open.er-api resultado inválido');
    const taxa = data.rates[para];
    if (!taxa) throw new Error('Moeda não encontrada');
    return taxa;
  } catch (errPrimary) {
    console.warn('API primária falhou, tentando fallback:', errPrimary.message);
  }

  // Fallback: fawazahmed0 CDN (GitHub-based, free, supports 150+ currencies)
  const res = await fetch(
    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${de.toLowerCase()}.min.json`
  );
  if (!res.ok) throw new Error('Todas as APIs de câmbio falharam');
  const data = await res.json();
  const taxa = data[de.toLowerCase()]?.[para.toLowerCase()];
  if (!taxa) throw new Error('Taxa não encontrada no fallback');
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

  try {
    const taxa = await obterTaxa(de, para);
    const convertido = (valor * taxa).toFixed(2);
    resultEl.textContent = `💰 ${convertido} ${para}`;
    resultEl.style.color = '#27ae60';
  } catch (error) {
    console.error('Erro na conversão:', error);
    resultEl.textContent = 'Erro ao obter taxa de câmbio. Tente novamente.';
    resultEl.style.color = '#c0392b';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Converter';
  }
}

function init() {
  popularMoedas();
  document.getElementById('convert-btn').addEventListener('click', converter);
}

document.addEventListener('DOMContentLoaded', init);
