# Colonização do espaço v2 — origens, espessuras e ritmos

Protótipo independente e offline. O estudo anterior foi preservado. **Nenhuma
alteração foi feita no site publicado.**

Abra [prototype.html](prototype.html) diretamente no navegador, sem servidor ou
rede. **Gerar outra** cria uma nova semente e origem; **Rever crescimento** repete
a animação atual. A cor começa em marfim e só muda por seleção manual. O controle
**Copiar semente e cor** permite reproduzir a combinação pelo campo de reprodução.

## O que mudou

- Uma origem por desenho, escolhida aleatoriamente dentro de uma área segura.
- Esporo inicial com núcleo branco brilhante de 7,6 × 9,6 px e halo discreto.
  Ele aparece antes das hifas e continua branco nas nove paletas.
- Faixas mais amplas: 1.800–4.200 nutrientes; cordões principais de 2,1–5,3 px
  adicionais à largura mínima; filamentos finos de 0,18–0,46 px. Extensão nominal
  horizontal de 67–100% e vertical de 72–100% da área de crescimento.
- Nutrientes em cinco manchas e três regiões esparsas, em vez de uma distribuição
  uniforme. Um pequeno leito inicial garante o início de uma colônia conectada.
- Cada ponta avança continuamente pela cadeia principal: um segmento começa no
  instante em que o anterior termina, sem uma nova pausa a cada passo. A velocidade
  muda gradualmente; apenas o nascimento de um ramo lateral recebe um pequeno atraso.
- Frentes espaciais recebem horários de ativação diferentes. Uma região começa
  primeiro, e as outras entram depois. A primeira frente real começa aos 400 ms;
  não é necessário esperar por uma direção preferida que talvez esteja vazia. Cada
  ramo herda sua frente; mudar de direção não aplica novamente o atraso inicial.
  O crescimento completo leva 22,5 segundos, com mais tempo dedicado ao avanço
  das pontas e sem aceleração/freada a cada trecho curto.
- Um segmento só cresce depois que o anterior termina. Cada ponta avança
  continuamente dentro do segmento; não há ramos aparecendo soltos.
- Os dez marcadores só aparecem após o crescimento chegar às respectivas posições,
  e ficam a mais de 70 px do esporo branco.
- O canvas mantém as coordenadas e a escala durante a animação. Não há zoom ou
  expansão simultânea de uma circunferência. A camada de ramos concluídos é
  reaproveitada; só as pontas em crescimento são redesenhadas a cada quadro.

São escolhas para um desenho artístico generativo, não uma simulação biológica
validada. A geometria continua usando colonização do espaço; a animação ganhou um
cronograma próprio para evitar o efeito de lente na abertura.

## Comparar

- [Cinco desenhos completos](images/comparison.png), com as sementes registradas
  nos títulos e em [metrics.json](metrics.json).
- [Nove paletas sobre a mesma geometria](images/palettes.png).
- [Quadros reais do protótipo em seis momentos](proof/growth-keyframes.png).
- [Vídeo do canvas real — aproximadamente 23 segundos](proof/growth.mp4).

O vídeo foi gravado em tempo real pelo `captureStream` do próprio canvas. Os
quadros de inspeção usam o mesmo renderizador da animação e tempos determinados,
para comparar as frentes sem alterar a escala.

## Nove referências de cor

Marfim é o padrão; todas as alternativas são selecionadas manualmente. Os valores
RGB são **aproximações artísticas**, sem pretensão de reproduzir uma espécie sob
condições específicas. Verde luminoso representa emissão de luz, não pigmentação.

| Paleta | Referência do micélio ou das hifas | Fonte |
| --- | --- | --- |
| Marfim | *Chlorociboria aeruginascens*, micélio claro não pigmentado | [Estudo](https://pmc.ncbi.nlm.nih.gov/articles/PMC6617353/) |
| Âmbar suave | *Pycnoporus cinnabarinus*, cinabarina alaranjada nas paredes das hifas | [Estudo](https://pmc.ncbi.nlm.nih.gov/articles/PMC10709268/) |
| Azul-esverdeado | *Chlorociboria aeruginascens*, xilindeína | [Estudo](https://pmc.ncbi.nlm.nih.gov/articles/PMC6617353/) |
| Amarelo-dourado | *Piloderma croceum*, pigmento micelial corticrocin | [Estudo](https://pmc.ncbi.nlm.nih.gov/articles/PMC12441137/) |
| Rosa | *Limonomyces roseipellis*, micélio rosado e felpudo | [Penn State](https://extension.psu.edu/turfgrass-diseases-pink-patch-causal-fungus-limonomyces-roseipellis) |
| Coral-avermelhado | *Laetisaria fuciformis*, massas de hifas rosa-coral a vermelhas | [Universidade de Illinois](https://ipm.illinois.edu/diseases/rpds/413.pdf) |
| Lilás | *Lepista sordida*, isolados A1/A4 em cultivo | [Tese, p.134](https://researchers-admin.westernsydney.edu.au/ws/portalfiles/portal/94793243/uws_495.pdf#page=151) |
| Violeta | *Lepista* spp., isolados A2/A3 em cultivo, espécie não conclusiva | [Tese, p.134](https://researchers-admin.westernsydney.edu.au/ws/portalfiles/portal/94793243/uws_495.pdf#page=151) |
| Verde luminoso | *Neonothopanus gardneri*, luz verde emitida pelo micélio — bioluminescência | [Estudo](https://pmc.ncbi.nlm.nih.gov/articles/PMC4382382/) |

Na tese de Stott, A1/A4 são classificados morfologicamente como *L. sordida*;
A2/A3 pertencem a um grupo de identificação específica não conclusiva. Não são
atribuídos aqui a *L. nuda*. As observações de cor são de hifas cultivadas.

Somente o verde luminoso recebe um halo discreto: um traço externo translúcido,
sem pulsação e sem `shadowBlur` por segmento. Os outros traços não recebem halo.
A camada concluída continua em cache, e o núcleo do esporo permanece branco.

A nota visível logo abaixo do canvas identifica a espécie e o pigmento ou contexto
de cada paleta, com link para o estudo. Ela acompanha a seleção manual e a
reprodução de uma semente com cor.

A seleção de paleta altera apenas o traço. Origem, geometria, ritmo e marcadores
permanecem iguais, e o esporo inicial continua branco.

## Arquivos e reprodução

`model.mjs` contém geração, cronograma e funções de desenho. `render.mjs` gera os
PNGs e incorpora o modelo em `prototype.template.html`, produzindo o arquivo HTML
independente. Após mudar o modelo ou o template, atualize o HTML com o renderizador.

```sh
node render.mjs
node verify.mjs
```

O renderizador aceita Sharp instalado normalmente ou `SHARP_MODULE` apontando
para sua entrada ESM. A captura de navegador aceita Playwright instalado normalmente
ou `PLAYWRIGHT_MODULE`. Para refazer as provas no Chrome:

```sh
node capture-browser.mjs
ffmpeg -i proof/growth.webm -c:v libx264 -pix_fmt yuv420p -movflags +faststart proof/growth.mp4
```

Os testes verificam repetição por semente, origens seguras e diferentes, amplitude
de espessuras/densidades, limites e números finitos, pai concluído antes do filho,
primeira frente aos 400 ms, continuidade sem intervalos na cadeia principal,
variação gradual de velocidade, dez marcadores separados do esporo e aparecimento
somente após o ramo chegar. Também comparam tempos de chegada a distâncias
semelhantes em direções diferentes. No navegador foram verificadas as paletas sem
mudança de geometria, o núcleo branco, nova geração, reprodução, redimensionamento
para celular, ausência de rede e ausência de erros de JavaScript.


Para refazer apenas o comparativo das nove paletas pelo canvas real, sem refazer as
cinco variações geométricas nem gravar novo vídeo, execute:

```sh
node capture-palettes.mjs
```

A verificação percorre as nove opções, confere espécie e URL da nota, fingerprint
completo de geometria/tempos, núcleo branco, dez marcadores vermelhos, cópia e
reprodução, layout desktop/celular e ausência de rede/erros. Nesta máquina, trocar
a paleta e repintar a colônia completa levou 6–11 ms; o verde luminoso levou 11 ms.
Os valores estão em `palette-metrics.json`.
