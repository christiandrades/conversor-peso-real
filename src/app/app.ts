import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';

import { MoedaService, Moeda } from './services/moeda.service';
import { HistoricoService } from './services/historico.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  moedas = signal<Moeda[]>([]);
  carregandoMoedas = signal(true);
  convertendo = signal(false);
  resultado = signal<string | null>(null);
  erro = signal<string | null>(null);

  valor = '';
  deMoeda = 'CLP';
  paraMoeda = 'BRL';

  historico = computed(() => this.historicoService.itens());

  constructor(
    private moedaService: MoedaService,
    private historicoService: HistoricoService,
  ) {}

  async ngOnInit() {
    const moedas = await this.moedaService.fetchMoedas();
    this.moedas.set(moedas);
    this.carregandoMoedas.set(false);
  }

  async converter() {
    const num = parseFloat(this.valor);
    if (isNaN(num) || num <= 0) {
      this.erro.set('Insira um valor numérico válido e positivo.');
      return;
    }
    this.erro.set(null);
    this.resultado.set(null);
    this.convertendo.set(true);
    try {
      const taxa = await this.moedaService.obterTaxa(this.deMoeda, this.paraMoeda);
      const convertido = (num * taxa).toFixed(2);
      this.resultado.set(convertido);
      this.historicoService.adicionar({
        de: this.deMoeda,
        para: this.paraMoeda,
        valor: num,
        convertido,
        taxa,
      });
    } catch {
      this.erro.set('Não foi possível obter a taxa. Verifique sua conexão.');
    } finally {
      this.convertendo.set(false);
    }
  }

  inverter() {
    const temp = this.deMoeda;
    this.deMoeda = this.paraMoeda;
    this.paraMoeda = temp;
    this.resultado.set(null);
  }

  limparHistorico() {
    this.historicoService.limpar();
  }
}
