# Cordões fúngicos — estudo generativo offline

Abra **prototype.html**. Esta pasta é um estudo novo; todas as versões anteriores e o site publicado permanecem intactos. Marfim é o padrão; amarelo é uma escolha manual de referência cromática separada.

## Referências inspecionadas

A estrutura toma como referências as fotografias de **Phanerochaete velutina**, especialmente a foto e ampliação B da figura 1.6 em [Bebber et al., 2006, Imaging complex nutrient dynamics in mycelial networks](https://markfricker.org/wp-content/uploads/2015/12/bebber_et_al-2006-fungi_in_the_environment.pdf), página impressa16: cordões de diferentes espessuras, anastomoses, rede fina e ligação entre um bloco de origem e um recurso distante. O núcleo fibroso claro e os exploradores finos também foram observados na figura 12D de [Meškauskas et al., 2004](https://markfricker.org/wp-content/uploads/2015/12/meskuaskas_et_al-2004-mycol_res-108-1241.pdf), página 1254, que mostra o fungo em areia preta. A figura 13 descreve orientação paralela/positiva e distinção entre hifas líderes e secundárias no modelo dos autores.

**Não reproduzimos esse modelo ou seus parâmetros**, e o desenho não é uma rede medida, reconstrução das fotos ou simulação calibrada da espécie. É uma interpretação independente das propriedades visuais e de algumas regras locais. Ainda é mais aberto/direcional que a fotografia. A foto externa em sources/reference-fig1-6B.png é apenas referência local identificada; não é asset aprovado para publicação. O renderer não depende das cópias temporárias dos PDFs.

A cor amarela toma como referência **Piloderma fallax**, fotografia da [figura 1f em Diversity, 2012](https://www.mdpi.com/1424-2818/4/2/196). O RGB escolhido, #ddb52c, é aproximação gráfica, sem medição colorimétrica. Não afirmamos que P. velutina possua essa cor ou que a rede gerada represente P. fallax. A referência cromática aparece separada da referência morfológica na prévia.

## O que o código faz

1. Distribui alvos de crescimento em manchas irregulares entre uma origem inferior-esquerda e recursos superiores/laterais. Pontas crescem por atração local, com direções influenciadas pelo ramo anterior, formando uma rede inicial conectada. Não há grade inicial.
2. Segmentos próximos de ramos não adjacentes ganham ligações laterais curvas. Cada ligação termina exatamente num nó existente: são ciclos de grafo reais, não cruzamentos decorativos. A semente de referência produz 293 ciclos.
3. Filamentos secundários consultam, a cada passo, a posição e a direção tangente de cordões próximos. Alinham-se paralelamente e se aproximam deles, produzindo agrupamento. Na referência,33.668 passos usaram esse campo. O núcleo claro também é composto por filamentos curvos conectados, não um disco opaco.
4. A espessura final usa descendência e um **peso heurístico dos caminhos que chegam aos recursos**. Esse peso é calculado a partir da geometria final antes da animação; não representa feedback temporal observado após contato, nem pressão/transporte hidráulico. A maturação visual engrossa continuamente os cordões já desenhados. Não é o modelo de fluxo de Tero/Physarum ou a reprodução de Heaton.
5. A apresentação dura 30 segundos, com frentes iniciais defasadas e continuidade pai-filho. Uma ponta que já começou percorre os segmentos continuamente. As fusões só se apresentam depois de ambos os lados estarem disponíveis. Não há zoom automático, troca de snapshots ou máscara circular.

## Controles e reprodução

Gerar outra, replay, pausa, duas cores, escala 1×–3× ancorada na origem e posição da animação. Cor/escala preservam o tempo. O desenho pode ser reproduzido pela semente/JSON; copiar inclui semente e cor. O ritmo e a disposição dos recursos são escolhas de apresentação, sem tempo ou distância biológicos calibrados.

- `node build.mjs`: incorpora o modelo e gera HTML autocontido, sem rede.
- `node verify.mjs`: determinismo, variação de semente, limites finitos, continuidade/cronologia pai-filho, destinos de fusões e presença do campo de orientação.
- `SHARP_MODULE=/caminho/sharp/dist/index.mjs node render.mjs`: gera duas imagens e comparação com a referência já preservada em sources/.
- `PLAYWRIGHT_MODULE=/caminho/playwright/index.mjs node check-browser.mjs`: controles, reprodução JSON, desktop/mobile e gravação real de uma animação de 30 segundos. Sem variáveis, usa os módulos instalados normalmente.

Artefatos em images/ e proof/. metrics.json e browser-checks.json registram as contagens e verificações.
