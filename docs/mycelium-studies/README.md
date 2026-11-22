# Estudos de micélio

Cinco variações do mesmo modelo de crescimento por pontas, ramificação lateral,
afilamento e encontro entre hifas. Trata-se de um desenho generativo artístico,
não de uma simulação biológica.

| Variante | Intenção |
| --- | --- |
| `balanced` · 01 | Hifas orgânicas: ramificações suaves, espessuras e densidade variáveis. Padrão do desenho ao vivo. |
| `cotton` · 02 | Micélio algodonoso: quatro colônias irregulares, muitas hifas finas, maior densidade. |
| `cords` · 03 | Cordões e capilares: contraste entre cordões grossos e hifas laterais delicadas. |
| `fan` · 04 | Leques de crescimento: ramificações mais estreitas e frentes alongadas. |
| `web` · 05 | Rede anastomosada: três colônias e crescimento sinuoso com encontros entre filamentos. |

As imagens usam a semente `fluxus-comparison-2026`, tela de 1440 × 900 e dez itens.
Os arquivos `*-browser.png` mostram o canvas real do p5 no Chrome; o comparativo
`browser-comparison.png` reúne essas capturas com legendas. `mobile-browser.png`
mostra a mesma integração em 390 × 844.

Para reproduzir a geometria em SVG/PNG, com as dependências do projeto instaladas:

```sh
node scripts/previews/render-mycelium.mjs
node --test scripts/previews/mycelium.test.mjs
```

Para experimentar a animação, execute Vite na raiz e abra
`/scripts/previews/index.html?preset=cotton` (ou outro identificador da tabela).
A página usa o mesmo `startMycelium` do site, incluindo teclado e navegação.
A opção `preset` de `startMycelium` seleciona a variante e `seed` permite
reproduzir um desenho. Sem `seed`, cada visita continua gerando um novo desenho.

Para refazer as capturas no Chrome, com Playwright disponível (no projeto ou em
`PLAYWRIGHT_MODULE`, caminho absoluto para seu `index.mjs`), mantenha Vite em
`http://127.0.0.1:4357` e execute:

```sh
node scripts/previews/capture-mycelium.mjs
```

`MYCELIUM_PREVIEW_URL` permite usar outra porta. O script também verifica a
abertura por teclado, navegação, redimensionamento para celular e remoção do
canvas sem erros de JavaScript.
