const API_URL = 'https://api.transferwise.com';
// Para usar a API da Wise, você precisa de uma API Key
// 1. Acesse: https://wise.com/help/articles/2932150/wise-api
// 2. Crie uma conta business na Wise
// 3. Gere uma API Key no painel de desenvolvedores
// 4. Cole sua API Key abaixo:
const API_KEY = '';

async function fetchCurrencies() {
  try {
    // Se não há API key, usar lista fallback diretamente
    if (!API_KEY) {
      console.info('API Key não configurada, usando moedas padrão');
      return getDefaultCurrencies();
    }

    const response = await fetch(`${API_URL}/v1/currencies`, {
      headers: { 
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const currencies = await response.json();
    // Mapear para o formato esperado se necessário
    return currencies.map(curr => ({
      code: curr.code,
      name: curr.name || curr.code
    }));
  } catch (error) {
    console.error('Erro ao buscar moedas:', error);
    return getDefaultCurrencies();
  }
}

function getDefaultCurrencies() {
  // Lista expandida de moedas principais para fallback
  return [
    { code: 'USD', name: 'Dólar Americano' },
    { code: 'EUR', name: 'Euro' },
    { code: 'BRL', name: 'Real Brasileiro' },
    { code: 'CLP', name: 'Peso Chileno' },
    { code: 'ARS', name: 'Peso Argentino' },
    { code: 'GBP', name: 'Libra Esterlina' },
    { code: 'JPY', name: 'Iene Japonês' },
    { code: 'CAD', name: 'Dólar Canadense' },
    { code: 'AUD', name: 'Dólar Australiano' },
    { code: 'CHF', name: 'Franco Suíço' },
  ];
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
  
  // Mostrar indicador de carregamento
  document.getElementById('result').textContent = '⏳ Convertendo...';
  
  try {
    let taxa;
    
    if (!API_KEY) {
      // Usar taxas simuladas quando não há API key
      taxa = await getSimulatedRate(de, para);
    } else {
      // Usar API da Wise
      const response = await fetch(`${API_URL}/v1/rates?source=${de}&target=${para}`, {
        headers: { 
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      taxa = Array.isArray(data) ? data[0]?.rate : data.rate;
    }
    
    if (!taxa) {
      throw new Error('Taxa de câmbio não encontrada');
    }
    
    const convertido = (valor * taxa).toFixed(2);
    const resultText = API_KEY 
      ? `💰 ${convertido} ${para}` 
      : `💰 ${convertido} ${para} (simulado)`;
      
    document.getElementById('result').textContent = resultText;
    
  } catch (error) {
    console.error('Erro na conversão:', error);
    document.getElementById('result').textContent = 
      'Erro ao converter. Verifique sua conexão ou API key.';
  }
}

// Função para simular taxas quando não há API key
async function getSimulatedRate(from, to) {
  // Taxas simuladas baseadas em valores aproximados (apenas para demonstração)
  const simulatedRates = {
    'USD_BRL': 5.2,
    'EUR_BRL': 5.7,
    'CLP_BRL': 0.0055,
    'BRL_USD': 0.19,
    'BRL_EUR': 0.175,
    'BRL_CLP': 180,
    'USD_EUR': 0.92,
    'EUR_USD': 1.09,
    'USD_CLP': 950,
    'CLP_USD': 0.00105,
  };
  
  const key = `${from}_${to}`;
  const reverseKey = `${to}_${from}`;
  
  if (simulatedRates[key]) {
    return simulatedRates[key];
  } else if (simulatedRates[reverseKey]) {
    return 1 / simulatedRates[reverseKey];
  } else if (from === to) {
    return 1;
  } else {
    // Taxa padrão se não encontrada
    return 1.1;
  }
}

async function init() {
  // Mostrar status da API
  showApiStatus();
  
  const moedas = await fetchCurrencies();
  popularMoedas(moedas);
  document.getElementById('convert-btn').addEventListener('click', converter);
}

function showApiStatus() {
  const statusElement = document.getElementById('api-status');
  if (statusElement) {
    if (API_KEY) {
      statusElement.textContent = '🟢 API Wise configurada';
      statusElement.className = 'api-status connected';
    } else {
      statusElement.textContent = '🟡 Modo demonstração (taxas simuladas)';
      statusElement.className = 'api-status demo';
    }
  }
}

document.addEventListener('DOMContentLoaded', init);
