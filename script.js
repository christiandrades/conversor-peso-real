function conversor() {
  const taxa = 0.0057; // Exemplo: 1 peso chileno = 0.0057 BRL (ajustável)
  const entrada = document.getElementById("valor").value;
  const valor = parseFloat(entrada.replace(",", "."));
  const resultadoEl = document.getElementById("resultado");

  if (isNaN(valor) || valor <= 0) {
    resultadoEl.textContent = "Por favor, insira um valor numérico válido.";
    return;
  }

  const convertido = (valor * taxa).toFixed(2);
  resultadoEl.textContent = `💰 R$ ${convertido} (BRL)`;
}
