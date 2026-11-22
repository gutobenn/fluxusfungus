# Micélio v3 — famílias de desenho e maturação

Estudo offline independente. O v2 permanece arquivado; o site publicado não foi
alterado. Abra [prototype.html](prototype.html) diretamente no navegador.

**Automático (sortear)** escolhe uma das três famílias a partir da nova semente a
cada visita ou **Gerar outra**. O seletor também permite comparar uma família
manualmente. Reproduzir ou copiar guarda semente, família e cor. As oito cores são
independentes da forma; o verde luminoso foi retirado, mantendo o azul-esverdeado.

## Três famílias, com referências reais

| Família artística | Referência de espécie e característica | Fonte |
| --- | --- | --- |
| Hifas abertas | *Phanerochaete velutina*: redes exploratórias de cordões em solo/serapilheira | [Fukasawa e colaboradores](https://pmc.ncbi.nlm.nih.gov/articles/PMC6976561/) |
| Felpudo e cordado | *Phallus impudicus*: hifas finas, exploradores e agregação em feixes, observados no timelapse | [Vídeo original de Patrick Hickey](https://www.youtube.com/watch?v=BuI8StesF74) |
| Leques rizomórficos | *Hypholoma fasciculare*: novos setores em leque em resposta a um recurso de madeira | [Dowson, Rayner e Boddy, 1986](https://www.davidmoore.org.uk/21st_century_guidebook_to_fungi_platinum/REPRINT_collection/Dowson_etal_mycelia_cord-forming_basidiomycetes.pdf), pp.204–205, DOI 10.1099/00221287-132-1-203 |

O vídeo [Mycelium (mushroom) Timelapse](https://www.youtube.com/watch?v=uVsCWKJjafU)
e a foto enviada também informaram a textura e os feixes dos leques. **A espécie da
foto e desse segundo vídeo não foi identificada.** Não são apresentados como
imagens de *H. fasciculare*.

As notas de desenho e de cor aparecem separadamente no protótipo. Uma paleta
inspirada em outra espécie não muda a referência morfológica do desenho.

São interpretações artísticas de padrões documentados, não retratos fixos nem
simulações biológicas validadas. A forma real depende do substrato, recursos e
ambiente. O engrossamento por idade do código é uma simplificação visual; não
reproduz mecanismos fisiológicos de resposta a recursos. O estudo de leques ainda
é mais aberto e estilizado que a colônia densa da foto.

## Diferenças implementadas

- **Hifas abertas:** preserva a colonização do espaço do estudo anterior, com
  nutrientes em manchas e corredores vazios.
- **Felpudo:** agrega filamentos curvos com ramificações, exploradores longos e
  uma trama intersticial de fibras entre cordões. Não usa marcas perpendiculares
  para representar pelos. Os cordões chegam finos e aumentam gradualmente de
  largura e opacidade depois da chegada.
- **Leques:** cresce por uma hierarquia de frentes guiadas, com bifurcações
  progressivas, trajetos paralelos conectados à mesma base e franjas ramificadas.
  Também há maturação dos cordões antigos.

A origem branca, os dez marcadores vermelhos e as oito referências de cor foram
preservados. Marcadores pertencem aos ramos principais e só aparecem após a hifa
chegar. Continuidades principais não recebem uma nova pausa a cada segmento.
Frentes iniciais começam em momentos diferentes, evitando uma circunferência que
se expande simultaneamente. Não há zoom.

Ramos maduros são guardados numa camada reaproveitada. Só pontas e cordões ainda
amadurecendo são repintados. Não há blur por filamento. Os grandes arrays usam
redução/loops, evitando limites de argumentos do JavaScriptCore do Safari.

## Imagens e provas reais

- [Comparativo de três famílias, mesma semente e marfim](images/styles.png).
- [Hifas abertas](images/style-clean.png), [felpudo](images/style-fuzzy.png) e
  [leques](images/style-fans.png).
- [Crescimento e engrossamento do felpudo](proof/fuzzy.mp4), aproximadamente 29 s.
- [Crescimento e engrossamento dos leques](proof/fans.mp4), aproximadamente 31 s.
- Quadros do canvas real: [felpudo](proof/fuzzy-keyframes.png),
  [leques](proof/fans-keyframes.png), [hifas abertas](proof/clean-keyframes.png).
- Capturas de interface: [desktop](proof/desktop.png), [celular](proof/mobile.png).

Os vídeos registram o canvas real em tempo real. As gravações de referência de
terceiros não foram copiadas para os entregáveis.

## Verificação e desempenho

```sh
node verify.mjs
node render.mjs
node capture-browser.mjs
```

Sharp e Playwright podem ser instalados normalmente ou indicados pelas variáveis
`SHARP_MODULE` e `PLAYWRIGHT_MODULE`. O HTML final inclui o código, sem depender de
servidor, rede ou bibliotecas externas. `base.mjs` contém a base preservada e as oito
paletas; `model.mjs` contém as famílias adicionais e o cronograma de maturação.

Verificados: determinismo, diversidade do sorteio, três geometrias distintas,
limites, pai antes do filho, continuidades sem intervalo, aumento real de largura,
dez marcadores separados do esporo, cópia/reprodução de família+semente+cor,
layout desktop/celular e ausência de erros no Chrome.

Na máquina de teste, durante as gravações:

| Família | Segmentos | FPS | Render médio | Render p95 |
| --- | ---: | ---: | ---: | ---: |
| Felpudo | 68.010 | 59,97 | 1,05 ms | 2,3 ms |
| Leques | 43.030 | 60,00 | 1,37 ms | 3,0 ms |

Um teste de pintura isolada do mesmo segmento mediu 12→64 pixels pintados no
felpudo e 12→98 nos leques entre a chegada e a maturação, demonstrando que o cordão
engrossa em vez de surgir já na largura final. Os resultados estão em
[browser-metrics.json](browser-metrics.json).

O protótipo também foi aberto no Safari e sua interface mostrou a animação em
execução com marcadores surgindo e notas científicas corretas. Os números de FPS
acima são do Chrome, não uma medição do Safari.

## Escala manual

O controle **Escala** amplia de 1× a 3×, ancorado no esporo branco. O botão **1×**
restaura a escala original. Mudar a escala não cria uma semente, não altera a
geometria nem reinicia o crescimento. Repetir ou gerar outra preserva a escala
escolhida; o valor padrão continua em 1×. O limite do canvas recorta naturalmente
as partes ampliadas que ficam fora da área visível.

O cache de segmentos maduros é redesenhado com a transformação na resolução final,
em vez de ampliar um bitmap já rasterizado. Pontas, cordões amadurecendo, esporo e
marcadores recebem a mesma transformação, aplicada apenas uma vez.

[Comparativo 1×/2×](proof/zoom/comparison.png),
[felpudo em 2×](proof/zoom/fuzzy-2x.png) e
[leques em 2×](proof/zoom/fans-2x.png).

`capture-zoom.mjs` verificou 1×, 2×, 3×, retorno pixel a pixel à imagem de 1×,
semente e geometria preservadas, avanço da animação após mudar a escala,
persistência em replay/nova geração, ponto branco ancorado e layout móvel,
sem erros de JavaScript.
