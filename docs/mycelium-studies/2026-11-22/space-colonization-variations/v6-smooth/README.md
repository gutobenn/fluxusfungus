# Neurospora — transições suavizadas

Abra **prototype.html**. Esta correção é uma nova prévia offline; v3, v4, v5, v6 e o site publicado permanecem intactos.

## O que causava os saltos

Na v6, `drawFrame()` usava uma janela mínima de apenas 0,035 da transição para traçar arestas cujos dois extremos eram classificados como âncoras. Em uma transição de quatro segundos, milhares de correções estruturais podiam surgir em **140 ms**. O quadro anterior também se apagava nos primeiros 40% da transição, embora o novo ainda estivesse sendo traçado. A segmentação/reindexação dos registros não permite interpretar essas mudanças como movimento observado de pontas individuais.

Nesta versão removemos a revelação por âncoras e qualquer inferência de trajetória individual. Cada registro é renderizado integralmente em seu próprio canvas, com a mesma câmera fixa. Os dois registros são misturados com pesos contínuos e a curva `6u⁵−15u⁴+10u³`, cuja velocidade e aceleração são nulas nas extremidades. A correção prioriza **ausência de saltos**, com uma dissolução explícita entre registros. Não é rastreamento de hifas nem uma reconstrução biológica validada.

Mantivemos os mesmos dez registros e 36 segundos de apresentação; não baixamos novos dados. Os limites, a câmera, as cores e o último quadro continuam os da v5. Os quadros exatos permanecem preservados e o último é pixel a pixel igual à v5. Pausa, replay, oito cores e escala 1×–3× continuam disponíveis; cor/escala não reiniciam o tempo. Os caches retêm no máximo três imagens para limitar memória.

## Por que há um vazio no centro?

Ele já existe na visualização original; não foi criado como máscara circular pela animação. Os dados fornecem uma rede que circunda essa região. O renderer original também omite as arestas ligadas ao nó mais próximo da média das coordenadas. No quadro final, é o nó 5794, ligado às 98 arestas com campo `Type=F`; as 8.103 arestas restantes são as mesmas que desenhamos.

Verificado no código original do commit `2fd578d8adbb749dbb7b609291b9e9112b5968cc`:

- [assets/index-CBpKdXiJ.js](https://github.com/synosys/animated-fungal-network-growth/blob/2fd578d8adbb749dbb7b609291b9e9112b5968cc/assets/index-CBpKdXiJ.js): após procurar o nó de menor distância à posição média, aplica `m.filter(yt=>yt.from!==qe&&yt.to!==qe)`.
- [generateData.py](https://github.com/synosys/animated-fungal-network-growth/blob/2fd578d8adbb749dbb7b609291b9e9112b5968cc/generateData.py): exporta coordenadas, nós e arestas das planilhas; preserva `Type` sem explicar sua função física.

**Não verificamos o que a área vazia representa fisicamente**, nem o significado biológico de `F`. Não afirmamos que seja inóculo, madeira, ausência real de fungo ou um artefato de aquisição. Preservamos a decisão de apresentação original, sem acrescentar raios centrais ou inventar uma explicação.

## Dados, reprodução e verificações

Os dados originais e suas contagens estão na pasta v6 e são reutilizados somente para leitura. A proveniência e os limites do conjunto permanecem descritos no [README da v6](../v6/README.md). Não é um gerador; apenas uma apresentação de registros observados. Não foi encontrada licença geral explícita no projeto fonte; continua um estudo local, sem integração ao site.

- `node build.mjs`: gera HTML autocontido a partir dos dados já coletados, sem rede.
- `PLAYWRIGHT_MODULE=/caminho/playwright/index.mjs SHARP_MODULE=/caminho/sharp/dist/index.mjs node check-browser.mjs`: valida controles, desktop/mobile, igualdade do final com v5 e diferenças de pixels em 549 pares temporais de aproximadamente 16,7 ms, amostrados em 360×225 a partir do canvas de 1440×900.
- `PLAYWRIGHT_MODULE=/caminho/playwright/index.mjs node record-browser.mjs`: grava o protótipo real no Chrome.

Os módulos também podem ser importados normalmente sem as variáveis quando instalados localmente. Resultados em `proof/`, `temporal-checks.json`, `browser-checks.json` e `motion-checks.json`.
