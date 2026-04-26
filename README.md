# Kr Converter — Conversor de Moedas & Crypto

> Converta valores entre 36 moedas mundiais e acompanhe as cotações das 10 principais criptomoedas em tempo real, direto no navegador — sem instalar nada.

**[→ Acessar a aplicação](https://christiandrades.github.io/conversor-peso-real)**

---

## O que a aplicação faz

| Funcionalidade | Detalhe |
|---|---|
| Conversor de moedas | 36 moedas (BRL, USD, EUR, ARS, CLP e mais) com taxas em tempo real |
| Taxa exibida | Mostra a taxa usada após cada conversão (ex: `1 CLP = 0,005342 BRL`) |
| Botão ⇄ | Inverte origem e destino com um clique |
| Cotações Crypto | Top 10: BTC, ETH, USDT, BNB, SOL, XRP, USDC, ADA, DOGE, TON |
| Atualização automática | Preços crypto atualizados a cada 30 segundos |
| Variação 24h | Cada crypto exibe a variação do dia em verde ou vermelho |
| Cache inteligente | Taxas salvas localmente por 30 min para respostas mais rápidas |
| Atalho de teclado | Pressione **Enter** no campo de valor para converter |

---

## Como usar

### Online
Acesse **[christiandrades.github.io/conversor-peso-real](https://christiandrades.github.io/conversor-peso-real)** — nenhuma instalação necessária.

### Localmente

**1. Clone o repositório**
```bash
git clone https://github.com/christiandrades/conversor-peso-real.git
cd conversor-peso-real
```

**2. Abra no navegador**

Opção A — abrir direto:
```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

Opção B — servidor local (recomendado para evitar restrições de CORS):
```bash
# Python 3
python -m http.server 8000

# Node.js (npx)
npx serve .
```
Depois acesse `http://localhost:8000` no navegador.

---

## Convertendo moedas

1. Digite o valor no campo **Valor**
2. Selecione a moeda de **origem** (ex: CLP)
3. Selecione a moeda de **destino** (ex: BRL)
4. Clique em **Converter** ou pressione **Enter**
5. O resultado aparece com a taxa usada logo abaixo

Use o botão **⇄** para inverter as moedas rapidamente.

---

## Cotações Crypto

A seção **Cotações Crypto** carrega automaticamente ao abrir a página e se atualiza a cada **30 segundos**. Para cada moeda são exibidos:

- Preço atual em **R$ (BRL)** e **USD**
- Variação nas últimas **24 horas** (▲ verde / ▼ vermelho)

Nenhuma ação do usuário é necessária — as cotações ficam sempre atualizadas enquanto a página estiver aberta.

---

## Tecnologias

- **HTML5 / CSS3 / JavaScript** — sem frameworks, sem dependências
- **[open.er-api.com](https://open.er-api.com)** — taxas de câmbio (primária)
- **[fawazahmed0 Currency API](https://github.com/fawazahmed0/exchange-api)** — fallback de câmbio
- **[CoinGecko API](https://www.coingecko.com/api)** — cotações de criptomoedas
- **GitHub Pages** — hospedagem estática gratuita

---

## Fluxo de desenvolvimento

As contribuições seguem o padrão:

```
feat/nome-da-funcionalidade → main
```

---

## Licença

Distribuído sob a licença **MIT**. Veja o arquivo [`LICENSE.txt`](LICENSE.txt) para mais detalhes.

---

<div align="center">

Desenvolvido por **Christian Andrade** &nbsp;|&nbsp; © 2026 **KrDevs**

[![GitHub](https://img.shields.io/badge/GitHub-christiandrades-181717?style=flat&logo=github)](https://github.com/christiandrades)

</div>
