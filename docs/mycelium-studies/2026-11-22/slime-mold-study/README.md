# Estudo offline de Physarum

`prototype.html` é uma prévia animada independente. Não altera o site Fluxus nem qualquer versão anterior de micélio ou Neurospora.

O desenho amarelo representa um modelo simplificado de tubos de **Physarum polycephalum**, um slime mold, não um fungo. A espécie é a referência do estudo de Tero; não é uma identificação da foto de Facebook compartilhada pelo usuário.

## Base concreta

- Referência inicial do usuário: [artigo da UBC](https://blogs.ubc.ca/communicatingscience2017w211/2018/01/29/brainless-slime-mold-grows-in-pattern-like-tokyos-subway-system/), fotos de rede amarela e comparação com a rede de transporte de Tóquio.
- Referência visual adicional do usuário: [publicação pública no grupo SlimeMold](https://www.facebook.com/groups/SlimeMold/posts/4077531675839993/), tratada como Physarum sp., sem confirmação da espécie. Tubos amarelos, laços e junções arredondadas orientam a apresentação; o desenho não reproduz a foto.
- Referência do mecanismo: Tero et al. (2010), *Rules for Biologically Inspired Adaptive Network Design*, Science 327:439–442, [DOI 10.1126/science.1177894](https://doi.org/10.1126/science.1177894), equações 1–2 e figura 4. [PDF consultado](https://pdodds.w3.uvm.edu/research/papers/others/2010/tero2010a.pdf).

## Regras implementadas

Uma malha planar inicial liga junções em posições levemente deslocadas de um reticulado triangular. Para cada passo, dois pontos de alimento distintos são sorteados como fonte e sumidouro. Um dos pontos centrais tem peso maior no sorteio, como adaptação declarada da importância do centro no experimento; não representa a localização de Tóquio.

As pressões são resolvidas por gradiente conjugado pré-condicionado no Laplaciano ponderado da rede. As vazões obedecem `Qij = Dij (pi − pj) / Lij`, com conservação nas junções e injeção/retirada `I0 = 2`. As condutividades são atualizadas por Euler: `D += dt * (|Q|^gamma / (1 + |Q|^gamma) − D)`. Logo, tubos muito usados são reforçados e os pouco usados perdem condutividade.

Parâmetros escolhidos: `gamma = 1.15`, `dt = 0.045`, 1.800 passos, 36 pontos de alimento espalhados também pelo interior. O artigo descreve maior presença de conexões alternativas em valores menores de gamma. Este conjunto é uma escolha deste estudo, não uma reprodução dos parâmetros e da geografia de uma figura específica. Há um piso numérico `D >= 1e-6` para preservar a solução do sistema de pressões; tubos quase extintos ficam invisíveis na apresentação.

## O que é apresentação gráfica

- O contorno da arena, as posições de alimento e as flutuações iniciais são determinados pela semente e não foram extraídos do mapa de Tóquio.
- O estudo começa com uma malha já existente, como o **modelo** da figura 4. Não simula o avanço de uma margem viva a partir de um inóculo, nem toda a fisiologia do organismo.
- As cadeias de tubos sem ramificação no desenho final são arredondadas com curvas quadráticas; o cálculo físico continua usando as arestas e os comprimentos originais. A largura desenhada usa a raiz quarta da condutividade média da cadeia, conforme a relação entre D e raio do tubo. A suavização não é uma regra biológica.
- Os 151 estados físicos de condutividade são preservados. Para apresentação, um filtro temporal exponencial de fator 0,18 suaviza a alternância aleatória das fontes, seguido de 32 estados de acomodação no último resultado. Os estados de apresentação são interpolados linearmente ao longo de 40 segundos. Isso é ritmo de reprodução, não tempo biológico ou medição experimental.
- O amarelo vem das referências visuais do organismo. Não é uma amostra espectral de pigmento.

## Controles

Pausar/continuar, rever, linha do tempo, escala manual 1×–3×, mostrar alimento e gerar uma nova semente. A escala fica fixa durante a reprodução. Cor/posição não são usadas para insinuar que isso é micélio de fungo.

## Verificação

`node verify.mjs` confere repetibilidade, semente distinta, malha conectada, pontos de alimento interiores, condutividades finitas, reforço e poda efetivos e resíduos de conservação. `verification.json` contém os valores medidos. A inspeção em navegador está em `proof/`.

As duas fotos em `references/` são referências externas de pesquisa, preservadas com origem indicada. Não são assets para publicação do produto. A implementação do modelo e o renderer foram escritos independentemente; não incorporam código de terceiros.
