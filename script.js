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
    // Lista de fallback mínima
    return [
      { code: 'USD', name: 'US Dollar' },
      { code: 'EUR', name: 'Euro' },
      { code: 'BRL', name: 'Real Brasileiro' },
      { code: 'CLP', name: 'Peso Chileno' },
    ];
  }
}

function popularMoedas(moedas) {
  const de = document.getElementById('fromCurrency');
  const para = document.getElementById('toCurrency');
  moedas.forEach((m) => {
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
