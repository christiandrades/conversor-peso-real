import { Injectable, signal } from '@angular/core';

export interface HistoricoItem {
  de: string;
  para: string;
  valor: number;
  convertido: string;
  taxa: number;
  data: string;
}

const HISTORICO_KEY = 'conversor_historico';
const HISTORICO_MAX = 10;

@Injectable({ providedIn: 'root' })
export class HistoricoService {
  readonly itens = signal<HistoricoItem[]>(this.#carregar());

  #carregar(): HistoricoItem[] {
    try {
      return JSON.parse(localStorage.getItem(HISTORICO_KEY) ?? '[]');
    } catch {
      return [];
    }
  }

  adicionar(item: Omit<HistoricoItem, 'data'>): void {
    const novoItem: HistoricoItem = {
      ...item,
      data: new Date().toLocaleString('pt-BR'),
    };
    const historico = [novoItem, ...this.itens()].slice(0, HISTORICO_MAX);
    localStorage.setItem(HISTORICO_KEY, JSON.stringify(historico));
    this.itens.set(historico);
  }

  limpar(): void {
    localStorage.removeItem(HISTORICO_KEY);
    this.itens.set([]);
  }
}
