# O que é Investimento Duplo?

Investimento Duplo é um produto estruturado protegido que não garante o montante principal. Ao comprar você pode selecionar o ativo, moeda do investimento, quantia de investimento e data de entrega. O seu retorno será denominado na moeda de investimento ou moeda alternativa, dependendo das condições abaixo.

Existem dois tipos de produtos de Investimento Duplo: “Comprar Baixo” e “Vender Alto”.

Produtos Comprar Baixo permitem que você compre a criptomoeda desejada (ex.: LRC) por um preço mais baixo no futuro usando stablecoins (USDC).

- Meta Atingida: Na Data de Liquidação, se o Preço de Mercado é igual ou abaixo do Preço Alvo, a moeda alvo (LRC) será comprada;
- Meta Não Atingida: Na Data de Liquidação, se o Preço de Mercado é maior que o Preço Alvo, você manterá suas stablecoins.
Em ambos cenários, você ganhará juros em cima das stablecoins. Quando o Preço Alvo for alcançado, a quantia de sua inscrição e juros serão usados para comprar LRC.

Produtos Vender Alto te dão a chance de vender suas criptomoedas (ex.: LRC) por um preço maior no futuro (por USDC).

- Meta Atingida: Na Data de Liquidação, se o Preço de Mercado é igual ou maior que o Preço Alvo, seus LRC serão vendidos por USDC.
- Meta Não Atingida: Na Data de Liquidação, se o Preço de Mercado é menor que o Preço Alvo, você manterá seus LRC.
Em ambos cenários, você ganhará juros em cima de sua moeda existente (LRC). Quando o Preço Alvo for alcançado, a quantia de sua inscrição e juros serão vendidos por USDC.

O token de seu investimento será congelado, mas continua em sua conta porque Loopring é uma DEX.

Cada produto comprado tem uma data de liquidação. Iremos pegar a média do preço de mercado dos últimos 30 minutos antes das 16:00 (UTC+8) na data de liquidação como o preço de liquidação.

> **Por favor, certifique-se que você entende o produto e os riscos antes de investir.**
***

## Como calcular os meus retornos?

Quando a meta de preço é alcançada, seu investimento e juros serão convertidos em USDC com a meta de preço na taxa de conversão.

### Exemplo 1:
###### Investir LRC por Investimento Duplo de LRC-USDC 

```text 
Meta de Preço: 0.48  
Data de Liquidação: 21-AGO-2022  
APR: 73% 
Moeda de Investimento: LRC
```

Suposto que o dia atual é 18 de Agosto, o preço de LRC é 0.42 e o usuário escolhe investir 1,000 LRC em Investimento Duplo por alguns dias.

###### Em 21-AGO-2022

- Cenário 1
  - `Se o Preço de Liquidação de LRC neste dia é menor que a Meta de Preço de 0.48 USDC, o usuário irá ganhar 0.6% de LRC, ou seja, 1000 * (1 + 73% / 365 * 3) LRC = 1006 LRC.`
- Cenário 2
  - `Se o Preço de Liquidação de LRC é maior que a Meta de Preço de 0.48 USDC, o usuário irá ganhar 0.6% de USDC, ou seja, 1000 * 0.48 * (1 + 73% / 365 * 3) USDC = 482.88 USDC.`

Após o pedido expirar, o usuário ganhará 0.6% de juros. A única incerteza é a moeda do retorno, pois depende do preço de liquidação de LRC/USDC na hora de expiração.

### Exemplo 2:

###### Investir USDC por Investimento Duplo de LRC-USDC

```text 
Meta de Preço: 0.38 
Data de Liquidação: 21-AUG-2022  
APR: 73% 
Moeda de Investimento: USDC  
```

Suposto que o dia atual é 18 de Agosto, o preço de LRC é 0.42 e o usuário escolhe investir 1,000 USDC em Investimento Duplo por alguns dias.

###### Em 21-AGO-2022

- Cenário 1
  - `Se o Preço de Liquidação de LRC neste dia é menor que a Meta de Preço de 0.38 USDC, o usuário irá ganhar 0.6% de LRC, ou seja, (1000/0.38) * (1 + 73% / 365 * 3) LRC = 2647.368 LRC.`
- Cenário 2
  - `Se o Preço de Liquidação de LRC é maior que a Meta de Preço de 0.38 USDC, o usuário irá ganhar 0.6% de USDC, ou seja, 1000 * (1 + 73% / 365 * 3) USDC = 1006 USDC. `

Após o pedido expirar, o usuário irá ganhar 0.6% de juros. A única incerteza é a moeda do retorno, que depende do preço de liquidação de LRC/USDC na hora de expiração.

### Definições

| Palavra | Descrição |
| :------------ | :------------ |
| Moeda de Investimento  | A moeda na qual você comprou o investimento duplo.  |
| Moeda de Liquidação  | A moeda que você receberá quando o pedido expirar. Será ou a moeda alvo ou USDC. Cada retorno é determinado dependendo se a meta de preço foi alcançada ou não.  |
| Data de Liquidação  | A data quando o pedido é finalizado. Retornos do pedido serão automaticamente adicionados em sua conta neste dia após as 16:00 (UTC+8). |
| APR  | O Rendimento Anual é calculado pelos juros anuais equivalentes, se usuário comprasse com a mesma taxa por um ano inteiro. Rendimento Anual = Rendimento / (Data de Expiração - Hoje) *365. *Dica: Este período é calculado em milissegundos.* |
| Meta de Preço  | Meta de Preço é um preço de referência. No Dia de Expiração, o Preço de Liquidação será comparado com o preço de referência.  |
| Preço de Liquidação  | A média aritmética do Índice de Liquidação que é observada a cada 4 segundos nos últimos 30 minutos antes das 16:00 (UTC+8) na data de Expiração.  |
| Índice de Liquidação  | O Índice de Liquidação é derivado de algumas corretoras líderes. Para ETH, isto inclui Bittrex, Bitstamp, Coinbase Pro, Gemini, Kraken, Itbit e LMAX Digital; para LRC, inclui Huobi, Binance, OKEx, KuCoin, FTX. O índice é calculado como a média destes valores, todos com peso igual. |

### Perguntas Frequentes

P： Qual é o prazo de compra para investimentos duplos?  
R： Por favor finalize a compra antes das 15:00 (UTC+8) no dia de liquidação.

P： Posso resgatar meus Investimentos Duplos antes da data de liquidação?  
R： Após finalizar o pedido, ele não poderá ser cancelado ou resgatado antes da data de liquidação. Após o pedido ser finalizado os tokens serão retornados para sua conta.

P： Quando receberei meus retornos?  
R： Iremos calcular os retornos de seu investimento na Data de Liquidação às 08:00 UTC baseado em seu Preco de Liquidação e Meta de Preço. Você receberá seus retornos dentro de 6 horas.

P： Qual o risco do investimento duplo?  
R： De acordo com as regras de investimento duplo a incerteza será a moeda final. A moeda de retorno dependerá se o preço de liquidação foi alcançado na data de liquidação.

P： Quais os benefícios de usar Investimento Duplo em Loopring?  
R： Seus tokens de investimento ficarão congelados, mas continuarão em sua conta pois Loopring é uma DEX. Quando o pedido expirar, se o preço não for alcançado, você ganhará juros e os tokens congelados serão desbloqueados; se o preço de liquidação for alcançado, seu investimento e juros serão convertidos no token alvo pela Meta de preço.

*O risco de investir em LRC, se o preço subir muito, o LRC será vendido por USDC pelo preço alvo.
O risco de investir em USDC, se o preço cair muito, o USDC será convertido em LRC pelo preço alvo (mesmo se o preço de LRC é menor que o preço alvo).*
***
