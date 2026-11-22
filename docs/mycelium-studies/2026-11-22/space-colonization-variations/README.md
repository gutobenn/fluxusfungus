# Colonização do espaço: um desenho novo a cada visita

Variações suaves da opção **03 · Colonização do espaço**, mantendo o aspecto
escolhido. A cada geração mudam as posições dos nutrientes e uma pequena faixa de
parâmetros. Não são novos algoritmos.

- Quantidade de nutrientes: 3.000 ±6%.
- Raio de influência: 76 px ±6%.
- Raio de consumo: 8 px ±6%.
- Passo de crescimento: 5,5 px ±4%.
- Origem, cores, tela de 1440 × 900 e dez marcadores permanecem consistentes.

As cinco imagens usam as sementes `ff-space-2026-01` até `ff-space-2026-05`.
Os parâmetros efetivos, quantidade de segmentos e tempo de geração estão em
[metrics.json](metrics.json). As imagens foram inspecionadas em conjunto em
[images/comparison.png](images/comparison.png).

## Experimentar

Abra [prototype.html](prototype.html) diretamente no navegador. O arquivo é
independente: funciona com `file://`, sem servidor, rede ou instalação.

Uma semente aleatória é criada ao abrir/recarregar a página. **Gerar outra** cria
mais um desenho e anima o crescimento. Em **Reproduzir um desenho**, é possível
copiar a semente atual ou informar uma anterior; a mesma semente reproduz o mesmo
desenho. A tela se ajusta à largura da janela, mantendo a proporção do estudo.

O protótipo não abre os conteúdos reais do site; os dez pontos servem para avaliar
sua distribuição. Este estudo permanece offline e não modifica o site publicado.

## Código e reprodução

O arquivo compartilhado `../algorithms.mjs` preserva a geometria anterior de
`spaceColonization(seed)` e acrescenta `spaceColonizationVariation(seed)`, que
ativa as pequenas variações de parâmetros. A semente governa tanto os parâmetros
quanto as posições dos nutrientes, portanto não é preciso salvar os dois
separadamente para reproduzir o resultado.

```sh
node render.mjs
node verify.mjs
```

O renderizador usa Sharp instalado normalmente ou informado por `SHARP_MODULE`:

```sh
SHARP_MODULE=/caminho/node_modules/sharp/dist/index.mjs node render.mjs
```

`render.mjs` produz os PNGs e monta o HTML independente a partir de
`prototype.template.html` e do algoritmo compartilhado. Após alterar o algoritmo,
execute novamente o renderizador para atualizar o protótipo.

Verificação adicional no Chrome, com Playwright disponível normalmente ou por
`PLAYWRIGHT_MODULE`:

```sh
node verify-browser.mjs
```

Foram verificados: preservação exata da geometria original da opção 03; cinco
sementes diferentes gerando geometrias diferentes; mesma semente repetindo o
resultado; parâmetros dentro das faixas; coordenadas finitas e dentro da tela;
dez marcadores distintos; abertura sem rede; nova semente ao recarregar; botão de
nova geração; reprodução pixel a pixel no canvas; largura móvel e ausência de
erros de JavaScript.

Nesta máquina, cada geração levou aproximadamente 0,5–0,7 segundo. O crescimento
é revelado em 145 quadros de animação depois de calcular a geometria.

## Protótipo v2

O [v2](v2/README.md) amplia as variações, sorteia a origem, recupera o esporo branco
inicial e usa frentes de crescimento em ritmos diferentes. Inclui paletas opcionais,
novas imagens e gravação da animação. O protótipo desta pasta permanece preservado.
