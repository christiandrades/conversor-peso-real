
function conversor() {
  var valorpeso = prompt("Digite um valor em Peso:");
  var umpeso = 0.01;
  var valorConvertido = valorpeso * umpeso;
  alert("O valor em reais é: R$" + valorConvertido.toFixed(2));
}
