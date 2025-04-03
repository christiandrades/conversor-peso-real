function conversor() {
  const taxa = 0.0057; // Exemplo: 1 peso chileno = 0.0057 BRL (ajustável)
  const entrada = prompt("Digite o valor em pesos chilenos (CLP):");

  const valor = parseFloat(entrada);

  if (isNaN(valor) || valor <= 0) {
    alert("Por favor, insira um valor numérico válido.");
    return;
  }

  const convertido = (valor * taxa).toFixed(2);
  alert(`💰 R$ ${convertido} (BRL)`);
}
