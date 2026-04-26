# Kr Converter

Conversor de moedas e cotações de criptomoedas em tempo real, desenvolvido com HTML, CSS e JavaScript puro.

**[Acessar a aplicação](https://christiandrades.github.io/conversor-peso-real)**

---

## Funcionalidades

- Conversão entre 36 moedas com taxas atualizadas em tempo real
- Exibe a taxa usada após cada conversão
- Botão ⇄ para inverter origem e destino rapidamente
- Pressione **Enter** para converter sem usar o mouse
- Cotações ao vivo das 10 principais criptomoedas (BTC, ETH, USDT, BNB, SOL, XRP, USDC, ADA, DOGE, TON) com variação de 24h
- Atualização automática das cotações crypto a cada 30 segundos
- Cache local de taxas por 30 minutos para respostas mais rápidas

---

## Como usar

**Online:** acesse o link acima, sem instalar nada.

**Localmente:**

```bash
git clone https://github.com/christiandrades/conversor-peso-real.git
cd conversor-peso-real
```

Abra o `index.html` direto no navegador ou rode um servidor local:

```bash
python -m http.server 8000
# depois acesse http://localhost:8000
```

---

## Tecnologias

- HTML5, CSS3, JavaScript
- [open.er-api.com](https://open.er-api.com) — taxas de câmbio
- [fawazahmed0/exchange-api](https://github.com/fawazahmed0/exchange-api) — fallback de câmbio
- [CoinGecko API](https://www.coingecko.com/api) — cotações de criptomoedas

---

## Licença

MIT — veja [LICENSE.txt](LICENSE.txt).

---

Desenvolvido por **Christian Andrade** · © 2026 **KrDevs**
