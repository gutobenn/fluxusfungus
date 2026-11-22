# Micélio — estudos offline v4

Abra `prototype.html` diretamente no navegador. Esta versão acrescenta **Malha com fusões** e **Emaranhado em profundidade** às três famílias da v3, preservadas em geometria e cronologia. A pasta v3 continua intacta. Nenhuma mudança no site publicado.

O modo Automático sorteia entre cinco famílias de forma reproduzível pela semente. Oito cores manuais com referências próprias, escala 1×–3× ancorada no inóculo, replay e reprodução JSON continuam disponíveis. A escala não gera outra geometria nem reinicia o relógio. O ponto inicial é branco; os dez marcadores vermelhos aparecem quando seus ramos chegam.

## Duas famílias novas

- **Malha com fusões**: pontas com direção persistente e curvatura correlacionada exploram um campo irregular de recursos. Ramificam e, ao alcançar nós locais antigos não adjacentes, fecham uma aresta de verdade. O nó terminal é identificado com seu alvo para calcular a topologia. A semente de referência produz 76 ciclos independentes, com pontas livres na periferia. Cordões antigos engrossam. Duração: 27 s.
- **Emaranhado em profundidade**: rede rasteira sustenta tufos de filamentos secundários realmente posicionados em 3D e projetados em 2D. Curvas elevadas, ramificações laterais, espessura e transparência por altura dão volume. Quatro planos de profundidade mantêm caches separados para filamentos maduros, ativos e em maturação; é uma aproximação de composição, sem oclusão 3D exata. Não há simulação de vizinhança ou fusão neste estilo. Duração: 31 s.

São desenhos generativos independentes, **não modelos biológicos validados nem retratos de uma espécie**. As três famílias anteriores conservam suas notas de referências morfológicas. As novas referem-se a modelos/estruturas gerais; a referência das cores permanece separada.

## Referências

- [Mycorust](https://github.com/ezeoleaf/mycorust), [licença MIT](https://github.com/ezeoleaf/mycorust/blob/main/LICENSE): inspiração para crescimento, ramificação e fusões locais. Não copiamos seu código ou implementamos seu transporte/pressão/poda.
- [Modelo mínimo de crescimento com ramificação e fusão, 2026](https://arxiv.org/html/2601.03877v1): transição entre redes arbóreas e malhas. Não reproduzimos calibração ou resultados quantitativos.
- [Pycelium](https://github.com/ETancredi/pycelium), [MIT](https://github.com/ETancredi/pycelium/blob/main/pycelium/LICENSE): referência para possibilidades de ramificação volumétrica. Este protótipo não implementa seu Neighbour-Sensing Model.
- [Cyberfungi, figuras 8–9](https://davidmoore.org.uk/CyberWEB/Cyber06.htm): referências visuais de hifas secundárias aéreas e organização em cordões.

## Reproduzir e verificar

`node verify.mjs` verifica cinco famílias no sorteio, oito cores, igualdade geométrica/temporal das três anteriores, determinismo, limites, conexão e cronologia pai-filho, chegada de dez marcadores e ciclos reais da malha em três sementes.

`SHARP_MODULE=/caminho/para/sharp/dist/index.mjs node render.mjs` gera somente as duas novas imagens e incorpora os módulos na prévia HTML. Sem variável, importa `sharp` normalmente.

`PLAYWRIGHT_MODULE=/caminho/para/playwright/index.mjs SHARP_MODULE=/caminho/para/sharp/dist/index.mjs node capture-browser.mjs` verifica o protótipo em Chrome, escala/reprodução e telas desktop/mobile, captura quadros e grava crescimento real. Sem variáveis, importa os módulos normalmente.

Artefatos: `images/new-styles.png`, `images/style-mesh.png`, `images/style-tufts.png`, `verification.json`, `browser-metrics.json`, `proof/`.
