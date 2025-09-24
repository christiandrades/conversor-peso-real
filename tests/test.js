const assert = require('assert').strict;
const {
  fetchCurrencies,
  obterTaxa,
} = require('../script.js');

async function runFetchCurrenciesFallbackTest() {
  const originalFetch = global.fetch;
  try {
    global.fetch = () => Promise.reject(new Error('network error'));
    const currencies = await fetchCurrencies();
    assert(Array.isArray(currencies), 'Lista de moedas deve ser um array');
    assert(currencies.length > 0, 'Lista de fallback não pode estar vazia');
    assert(
      currencies.some((currency) => currency.code === 'USD'),
      'Lista de fallback deve conter USD'
    );
  } finally {
    global.fetch = originalFetch;
  }
}

async function runObterTaxaFallbackTest() {
  const originalFetch = global.fetch;
  const calls = [];
  try {
    global.fetch = async (url, options) => {
      calls.push({ url, options });
      if (calls.length === 1) {
        return { ok: false };
      }
      return {
        ok: true,
        json: async () => ({ info: { rate: 4.5 } }),
      };
    };
    const rate = await obterTaxa('USD', 'BRL');
    assert.strictEqual(rate, 4.5, 'Taxa de fallback deve ser utilizada');
    assert(
      calls[0].url.includes('/rates?source=USD&target=BRL'),
      'Primeira chamada deve ser para a API da Wise'
    );
    assert(
      calls[1].url.startsWith('https://api.exchangerate.host/convert?'),
      'Segunda chamada deve ser para o serviço de fallback'
    );
  } finally {
    global.fetch = originalFetch;
  }
}

(async () => {
  await runFetchCurrenciesFallbackTest();
  await runObterTaxaFallbackTest();
  console.log('Todos os testes passaram.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
