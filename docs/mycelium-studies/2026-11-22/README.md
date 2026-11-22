> **Fechamento de 22/11/2026:** comece por [RETOMADA.md](RETOMADA.md) e pelo [índice visual dos estudos](index.html). O relatório original dos cinco algoritmos está preservado abaixo.

# Cinco algoritmos de micélio — comparação offline

Estes são **cinco métodos diferentes**, e não cinco configurações de um mesmo
motor. Os PNGs são saídas reais dos algoritmos em `algorithms.mjs`, desenhadas em
SVG e rasterizadas por Sharp. Nenhuma imagem foi gerada por IA.

**Estudo isolado:** estes arquivos não são importados pelo site. Não houve edição,
commit, push ou deploy do Fluxus Fungus para produzir esta comparação. O micélio
publicado permanece no algoritmo original.

## Comparação

Abra [images/comparison.png](images/comparison.png) para ver as cinco opções.
Os arquivos individuais têm resolução de 1440 × 900. Todos usam fundo `#302625`,
filamentos claros, a origem `(820, 500)`, a semente
`fluxus-five-algorithms-2026-11-22` e dez marcadores vermelhos sobre seus próprios
filamentos. Os marcadores não mudam a geração: são distribuídos depois do desenho,
maximizando a separação entre eles. As diferenças de extensão e densidade são
resultados dos métodos; não houve redimensionamento independente dos desenhos.

| Opção | Método e diferença | Parâmetros desta experiência |
| --- | --- | --- |
| **01 · Pontas com memória** | Caminhantes persistentes crescem pelas pontas; a curvatura tem memória, e cada ponta cria ramos laterais conforme sua idade. Produz hifas sinuosas e irregulares. | Oito pontas; avanço 2,2 px; ramificação após 20–65 passos e depois 23–58; ramos afinam e param ao encontrar outra hifa. Limites: 1.200 rodadas ou 65.000 segmentos. |
| **02 · Gramática ramificada** | Um L-system estocástico reescreve símbolos antes do desenho; uma tartaruga com pilha transforma colchetes em ramificações. Produz leques dendríticos com estrutura recursiva. | Seis raízes, sete reescritas; produções `F[+X]F[-X]`, `FF[+X]X`, `F[+X]FX`, `F[-X]FX`; `F` permanece `F`; rotação 0,38–0,78 rad; avanço `(30 cos θ, 23 sen θ)`; espessura ×0,72 ao abrir um ramo. |
| **03 · Colonização do espaço** | Nutrientes distribuídos pelo espaço atraem a ponta mais próxima; pontos de nutrientes desaparecem quando uma hifa chega. A média das direções cria divisões e uma rede que ocupa o espaço disponível. | 3.000 atratores uniformes; influência 76 px; consumo a 8 px; avanço 5,5 px; máximo 330 rodadas ou 12.000 nós. Espessura depende do tamanho da subárvore. |
| **04 · Agregação por difusão** | Partículas em passeio browniano aderem ao agregado no primeiro contato. Os ramos surgem pela probabilidade de chegada das partículas, sem uma regra explícita de ramificação. Produz uma estrutura fractal rugosa. | 9.000 lançamentos, até 5.500 passos por lançamento; adesão a 4,1 px; passos isotrópicos de 3 px perto do agregado e 7 px longe; relançamento ao escapar; escala horizontal 1,75. Nesta semente, 3.696 partículas aderem. |
| **05 · Rede de transporte** | Dijkstra encontra trajetos entre a origem e nutrientes em um grafo de substrato. Trajetos compartilhados engrossam, e algumas arestas laterais fecham circuitos. Produz uma rede de corredores e conexões. | Malha irregular de 22 px, seis vizinhos por ponto, custo de aresta heterogêneo; 330 nutrientes; reforço pela quantidade de trajetos; 14% das arestas laterais elegíveis são mantidas. |

São **modelos artísticos**, não simulações biológicas validadas. A opção 02 pode
ter cruzamentos porque sua gramática não resolve colisões; a 03 forma uma árvore,
sem fusões entre ramos; a 04 é uma DLA discreta limitada pela tela e pelo orçamento
de passos; a 05 mostra deliberadamente a geometria do grafo. A suavidade, densidade
e integração com os itens podem ser refinadas depois de escolher uma direção.

## Reproduzir

Requisitos: Node.js 22 ou 24 e Sharp instalado. O gerador usa `import('sharp')` por
padrão. Se Sharp já estiver instalado em outro projeto, indique o caminho absoluto
da entrada ESM pela variável `SHARP_MODULE`.

```sh
node render.mjs
node verify.mjs
```

Exemplo com uma instalação existente:

```sh
SHARP_MODULE=/caminho/node_modules/sharp/dist/index.mjs node render.mjs
```

`render.mjs` grava os cinco PNGs, o comparativo e `metrics.json`. `verify.mjs` roda
cada algoritmo duas vezes e verifica igualdade exata por hash, coordenadas finitas,
limites da tela, cobertura espacial, dez marcadores distintos e limite de duração.
Não há servidor, automação de navegador ou acesso à rede.

O método 04 é o mais caro: aproximadamente 12 segundos por geração nesta máquina;
os outros levaram de poucos milissegundos a 0,6 segundo. Os tempos de uma execução
ficam registrados em `metrics.json`. As imagens são estáticas: ainda não avaliam o
custo de animação no celular.

## Variações da opção 03 escolhida

O estudo [space-colonization-variations](space-colonization-variations/README.md)
mostra cinco sementes da colonização do espaço, com variações suaves. Inclui um
[protótipo independente](space-colonization-variations/prototype.html) que cria um
novo desenho a cada abertura e oferece o botão **Gerar outra**. Continua somente
offline.
