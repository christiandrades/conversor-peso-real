/**
 * Testes automatizados para o Conversor de Moedas
 * Executar com: node tests/script.test.js
 */

let passed = 0;
let failed = 0;

function assert(description, condition) {
  if (condition) {
    console.log(`  ✓ ${description}`);
    passed++;
  } else {
    console.error(`  ✗ ${description}`);
    failed++;
  }
}

// --- Mock de localStorage ---
const store = {};
const localStorageMock = {
  getItem: (key) => store[key] ?? null,
  setItem: (key, value) => { store[key] = String(value); },
  removeItem: (key) => { delete store[key]; },
};
global.localStorage = localStorageMock;

// --- Funções extraídas de script.js para teste unitário ---
const HISTORICO_KEY = 'conversor_historico';
const HISTORICO_MAX = 10;

function salvarHistorico(de, para, valor, convertido, taxa) {
  const historico = JSON.parse(localStorage.getItem(HISTORICO_KEY) || '[]');
  historico.unshift({ de, para, valor, convertido, taxa, data: new Date().toLocaleString('pt-BR') });
  if (historico.length > HISTORICO_MAX) historico.length = HISTORICO_MAX;
  localStorage.setItem(HISTORICO_KEY, JSON.stringify(historico));
  return historico;
}

function limparHistorico() {
  localStorage.removeItem(HISTORICO_KEY);
  return [];
}

// --- Testes: Histórico ---
console.log('\n[Histórico de Conversões]');

localStorageMock.removeItem(HISTORICO_KEY);
const h1 = salvarHistorico('CLP', 'BRL', 1000, '5.50', 0.0055);
assert('Salva o primeiro item no histórico', h1.length === 1);
assert('Item tem a moeda de origem correta', h1[0].de === 'CLP');
assert('Item tem a moeda de destino correta', h1[0].para === 'BRL');
assert('Item tem o valor correto', h1[0].valor === 1000);
assert('Item tem o resultado convertido correto', h1[0].convertido === '5.50');

const h2 = salvarHistorico('USD', 'EUR', 100, '92.00', 0.92);
assert('Novo item vai para o início da lista', h2[0].de === 'USD');
assert('Item anterior permanece na posição 1', h2[1].de === 'CLP');

// Testa limite máximo
localStorageMock.removeItem(HISTORICO_KEY);
for (let i = 0; i < 12; i++) {
  salvarHistorico('USD', 'BRL', i, String(i * 5), 5);
}
const hMax = JSON.parse(localStorage.getItem(HISTORICO_KEY));
assert(`Histórico não ultrapassa ${HISTORICO_MAX} itens`, hMax.length === HISTORICO_MAX);

// Testa limpar histórico
limparHistorico();
const hVazio = localStorage.getItem(HISTORICO_KEY);
assert('Limpar histórico remove os dados do localStorage', hVazio === null);

// --- Testes: Validação de valor ---
console.log('\n[Validação de Valor]');

function valorEhValido(v) {
  const num = parseFloat(v);
  return !isNaN(num) && num > 0;
}

assert('Valor positivo é válido', valorEhValido('100'));
assert('Valor decimal é válido', valorEhValido('0.5'));
assert('Zero é inválido', !valorEhValido('0'));
assert('Valor negativo é inválido', !valorEhValido('-10'));
assert('Texto é inválido', !valorEhValido('abc'));
assert('Vazio é inválido', !valorEhValido(''));

// --- Testes: Formatação do resultado ---
console.log('\n[Formatação do Resultado]');

function formatarConvertido(valor, taxa) {
  return (valor * taxa).toFixed(2);
}

assert('1000 CLP a 0.0055 = 5.50 BRL', formatarConvertido(1000, 0.0055) === '5.50');
assert('100 USD a 0.92 = 92.00 EUR', formatarConvertido(100, 0.92) === '92.00');
assert('1 USD a 5.00 = 5.00 BRL', formatarConvertido(1, 5) === '5.00');

// --- Resumo ---
console.log(`\n${'─'.repeat(40)}`);
console.log(`Resultado: ${passed} passaram, ${failed} falharam`);
if (failed > 0) process.exit(1);
