import { Injectable } from '@angular/core';

export interface Moeda {
  code: string;
  name: string;
}

const FAWAZ_BASE = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1';
const FAWAZ_MIRROR = 'https://latest.currency-api.pages.dev/v1';
const FRANKFURTER_URL = 'https://api.frankfurter.app';

const MOEDAS_FALLBACK: Moeda[] = [
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

@Injectable({ providedIn: 'root' })
export class MoedaService {
  async fetchMoedas(): Promise<Moeda[]> {
    const urls = [`${FAWAZ_BASE}/currencies.json`, `${FAWAZ_MIRROR}/currencies.json`];
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const data: Record<string, string> = await res.json();
        return Object.entries(data)
          .map(([code, name]) => ({ code: code.toUpperCase(), name }))
          .sort((a, b) => a.code.localeCompare(b.code));
      } catch { /* tenta próxima */ }
    }
    return MOEDAS_FALLBACK;
  }

  async obterTaxa(de: string, para: string): Promise<number> {
    const base = de.toLowerCase();
    const target = para.toLowerCase();

    const fawazUrls = [
      `${FAWAZ_BASE}/currencies/${base}.json`,
      `${FAWAZ_MIRROR}/currencies/${base}.json`,
    ];
    for (const url of fawazUrls) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const data: Record<string, Record<string, number>> = await res.json();
        const taxa = data[base]?.[target];
        if (taxa) return taxa;
      } catch { /* tenta próxima */ }
    }

    // Fallback: Frankfurter (BCE, ~33 moedas principais)
    try {
      const res = await fetch(`${FRANKFURTER_URL}/latest?from=${de}&to=${para}`);
      if (res.ok) {
        const data: { rates: Record<string, number> } = await res.json();
        const taxa = data.rates?.[para];
        if (taxa) return taxa;
      }
    } catch { /* ignora */ }

    throw new Error('Não foi possível obter a taxa de câmbio.');
  }
}
