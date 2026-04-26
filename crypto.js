const CRYPTOS = [
  { id: 'bitcoin',     name: 'Bitcoin',   symbol: 'BTC',  badge: '₿'  },
  { id: 'ethereum',    name: 'Ethereum',  symbol: 'ETH',  badge: 'Ξ'  },
  { id: 'tether',      name: 'Tether',    symbol: 'USDT', badge: '₮'  },
  { id: 'binancecoin', name: 'BNB',       symbol: 'BNB',  badge: '◆'  },
  { id: 'solana',      name: 'Solana',    symbol: 'SOL',  badge: '◎'  },
  { id: 'ripple',      name: 'XRP',       symbol: 'XRP',  badge: '✕'  },
  { id: 'usd-coin',    name: 'USD Coin',  symbol: 'USDC', badge: '$'  },
  { id: 'cardano',     name: 'Cardano',   symbol: 'ADA',  badge: '₳'  },
  { id: 'dogecoin',    name: 'Dogecoin',  symbol: 'DOGE', badge: 'Ð'  },
  { id: 'toncoin',     name: 'Toncoin',   symbol: 'TON',  badge: '💎' },
];

const REFRESH_MS = 30000;

async function fetchCryptoPrices() {
  const ids = CRYPTOS.map((c) => c.id).join(',');
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=brl,usd&include_24hr_change=true`
  );
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
  return res.json();
}

function fmtBRL(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function fmtUSD(v) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
}

function renderCryptos(data) {
  document.getElementById('crypto-list').innerHTML = CRYPTOS.map((coin) => {
    const p = data[coin.id];
    if (!p) return '';
    const change = p.usd_24h_change ?? 0;
    const cls = change >= 0 ? 'up' : 'down';
    const sign = change >= 0 ? '+' : '';
    return `
      <div class="crypto-item">
        <span class="crypto-badge">${coin.badge}</span>
        <div class="crypto-info">
          <span class="crypto-name">${coin.name}</span>
          <span class="crypto-symbol">${coin.symbol}</span>
        </div>
        <div class="crypto-prices">
          <span class="crypto-brl">${fmtBRL(p.brl)}</span>
          <span class="crypto-usd">${fmtUSD(p.usd)}</span>
        </div>
        <span class="crypto-change ${cls}">${sign}${change.toFixed(2)}%</span>
      </div>`;
  }).join('');
}

async function updateCryptos() {
  const listEl = document.getElementById('crypto-list');
  const stampEl = document.getElementById('crypto-stamp');
  try {
    const data = await fetchCryptoPrices();
    renderCryptos(data);
    stampEl.textContent = `Atualizado às ${new Date().toLocaleTimeString('pt-BR')}`;
  } catch (err) {
    console.error('Erro cotações crypto:', err);
    listEl.innerHTML = '<p class="crypto-error">Não foi possível carregar as cotações. Tentando novamente…</p>';
    stampEl.textContent = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateCryptos();
  setInterval(updateCryptos, REFRESH_MS);
});
