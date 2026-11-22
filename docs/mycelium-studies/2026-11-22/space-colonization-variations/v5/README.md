# v5 — comparação com uma rede observada

Abra **empirical-study.html**. É um renderer independente de um frame medido de **Neurospora**, fornecido pelo projeto Animated Fungal Network Growth. Não é simulação, novo algoritmo gerador, identificação de espécie ou prova da aparência de uma colônia arbitrária. Não há semente, geração aleatória, ponto inicial ou marcadores inventados.

## Origem e preservação

[Projeto fonte](https://github.com/synosys/animated-fungal-network-growth), commit 2fd578d (prefixo informado na coleta da referência). Os CSVs originais estão em ../../references-github-2026-11-22/original-synosys/data/neurospora/ e permanecem intactos. Frame 745A6398: 5.794 nós, 8.201 arestas nos dados. O renderer original oculta o nó mais próximo da média de coordenadas (nó5794) e suas 98 arestas; desenhamos as mesmas **8.103 arestas visíveis**, preservando os endpoints e as coordenadas. Também mantemos a proporção visual das escalas independentes x/y do original, para comparação reconhecível. Não se deve interpretar a proporção da tela como escala métrica isotrópica.

O código de leitura CSV e renderização é nosso; o bundle do projeto não foi copiado. Não foi encontrada licença explícita geral no projeto fonte. Dados/imagem são referências externas locais, não assets aprovados para redistribuição ou publicação. A captura do renderer original e o nosso redesenho estão claramente separados.

Oito cores e escala1×–3× são controles de apresentação. A cor é uma aproximação artística independente da rede observada. As notas das cores citam suas referências próprias.

## Reproduzir

`SHARP_MODULE=/caminho/para/sharp/dist/index.mjs node render-empirical.mjs` lê os três CSVs originais, valida índices e gera PNGs e HTML autocontido. Sem variável, importa sharp normalmente. A prévia não faz requisições de rede.

- images/empirical-source-versus-study.png: fonte original versus nosso renderer.
- images/empirical-neurospora.png: rede no fundo/cor do site.
- empirical-checks.json: contagens, limites e validação de índices.

## Diagnóstico do modelo do artigo

A tentativa anterior desta iteração foi preservada em **paper-diagnostic/**, com comparação da figura2E direita e implementação independente das regras publicadas. O resultado ficou mais angular, com células alongadas: **não reproduz visualmente a figura**, portanto não é apresentado como um novo estilo fiel. Não acrescentamos ruído/curvatura não especificados no texto para esconder a diferença. Os parâmetros e a semente foram escolhidos; o código e a realização exata dos autores não estavam disponíveis.

As pastas v3/v4 e o site publicado permanecem intocados.
