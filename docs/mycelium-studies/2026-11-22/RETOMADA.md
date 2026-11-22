# Retomada — Fluxus Fungus e fechamento da sessão

Atualizado em **22 de novembro de 2026**. Este documento é o ponto de entrada para continuar outro dia.

## Estado ao encerrar

**Os novos desenhos de micélio são estudos locais. Nenhum deles está aprovado para publicação.** O arquivo `src/scripts/mycelium.js` do site continua igual ao original restaurado, baseline `6e94ea4`. Isso se refere ao arquivo, não a voltar todo o repositório para aquele commit.

Abra o [índice visual](index.html) para comparar os estudos. Os HTMLs funcionam localmente, sem instalar dependências ou iniciar servidor. Os códigos, referências e resultados anteriores foram preservados.

Pasta deste material no repositório Fluxus Fungus: `docs/mycelium-studies/2026-11-22/`. Branch de preservação: `chore/mycelium-studies-2026-11-22`. A cópia inicial foi produzida no workspace personal-agent-augusto-bennemann.

## Por onde retomar

| Estudo | Abrir | O que representa / situação |
| --- | --- | --- |
| **Leques com volta completa — mais recente** | [Preview](rhizomorphic-fan-full-circle/prototype.html) · [comparação](rhizomorphic-fan-full-circle/images/comparison.png) · [vídeo](rhizomorphic-fan-full-circle/proof/growth.mp4) | Colônia irregular que termina cobrindo todas as direções, com frentes defasadas. Inclui seletor para os leques abertos anteriores. |
| **Três famílias + escala (v3)** | [Preview](space-colonization-variations/v3/prototype.html) · [imagens](space-colonization-variations/v3/images/styles.png) | Colonização de espaços, felpudo e leques. O melhor ponto de partida para selecionar famílias. |
| **Cordões fúngicos** | [Preview](fungal-cord-study/prototype.html) · [referência × estudo](fungal-cord-study/images/reference-versus-study.png) · [vídeo](fungal-cord-study/proof/growth.mp4) | Inspirado em redes de Phanerochaete velutina; filamentos secundários, fusões e reforço de caminhos. |
| **Neurospora animada, corrigida** | [Preview](space-colonization-variations/v6-smooth/prototype.html) · [vídeo](space-colonization-variations/v6-smooth/proof/observed-network.mp4) | Interpolação suave de dez observações de uma rede real. Não é um gerador aleatório. |
| **Neurospora estática (v5)** | [Preview](space-colonization-variations/v5/empirical-study.html) · [comparação](space-colonization-variations/v5/images/empirical-source-versus-study.png) | Rede observada, útil para conferir a fidelidade do resultado final animado. |
| **Physarum — estudo separado** | [Preview](slime-mold-study/prototype.html) · [vídeo](slime-mold-study/proof/physarum.mp4) | Modelo de adaptação por fluxo de slime mold. Não é fungo. |
| **Referências originais do GitHub** | [Galeria](references-github-2026-11-22/index.html) | Imagens originais de Mycorust e visualização dos dados de Neurospora. |
| **Cinco algoritmos iniciais** | [Comparação](images/comparison.png) · [relatório](README.md) | O favorito foi o **03, colonização de espaços**. |

Cada subpasta tem seu próprio README com parâmetros, fontes e instruções. Para imagens, também é possível usar `open -a Preview caminho/da/imagem.png` no Mac.

## Preferências e decisões do usuário

- Preservar as experiências anteriores e testar novas opções sem substituí-las.
- Variar origem, tamanho, espessura, espaçamento e desenho a cada visita; manter um ponto inicial mais destacado.
- Crescimento mais lento e contínuo, evitando saltos e pequenos troncos que avançam rápido e param.
- Evitar a sensação de lente/círculo expandindo simultaneamente. A volta completa pode existir como variação, mas com crescimento desigual entre direções e câmera fixa.
- Escala manual de **1× a 3×**, sobretudo para felpudo e leques. Alterar cor/escala deve preservar a semente e o instante da animação.
- Cores diferentes foram bem recebidas, com nota sobre a referência real. **Verde luminoso foi rejeitado** e saiu das seleções posteriores; o verde-azulado continua como opção.
- Referência de cor e referência de morfologia são independentes. Não apresentar aproximações artísticas como simulações calibradas de uma espécie.
- Falta escolher quais famílias e paletas compõem a seleção final. Comentários positivos sobre previews não autorizam publicar.

## Último estudo: leques de volta completa

O padrão usa leques sobrepostos e ramificações laterais para ocupar o entorno da origem, sem pintar um disco ou anel artificial. O crescimento é defasado entre setores. “Fechar o círculo” aqui significa cobertura visual em todas as direções, **não demonstra anastomose celular nem uma variedade biológica específica**.

A verificação mediu 72 setores de 5° em três faixas radiais, para três sementes, com cobertura de 360°. O seletor “Leques abertos” conserva a geometria e o tempo da v3. Um erro que alongava temporariamente os segmentos foi corrigido limitando o progresso a 0–1; o vídeo atual já contém a correção.

Leia [o README](rhizomorphic-fan-full-circle/README.md) e os registros [de cobertura](rhizomorphic-fan-full-circle/coverage-checks.json) e [do navegador](rhizomorphic-fan-full-circle/browser-checks.json).

## Referências e limites científicos

- **Leques e cordões:** [Dowson, Rayner e Boddy (1986)](https://www.davidmoore.org.uk/21st_century_guidebook_to_fungi_platinum/REPRINT_collection/Dowson_etal_mycelia_cord-forming_basidiomycetes.pdf) descrevem sistemas radiais e respostas a recursos; [Meskauskas et al. (2004)](https://markfricker.org/wp-content/uploads/2015/12/meskuaskas_et_al-2004-mycol_res-108-1241.pdf) apresentam orientação e formação de cordões. Sustentam a inspiração, não os tempos e parâmetros do nosso desenho.
- **Cordões locais:** a comparação usa fotografia de P. velutina de [Bebber et al. (2006)](https://markfricker.org/wp-content/uploads/2015/12/bebber_et_al-2006-fungi_in_the_environment.pdf). O reforço de caminhos é uma heurística pré-calculada, não uma simulação hidráulica ou resposta temporal validada a alimento. O amarelo deste estudo remete a Piloderma fallax, [figura 1f](https://www.mdpi.com/1424-2818/4/2/196); o RGB é uma aproximação artística.
- **Neurospora:** os dados vêm de [synosys/animated-fungal-network-growth](https://github.com/synosys/animated-fungal-network-growth), commit `2fd578d8adbb749dbb7b609291b9e9112b5968cc`. O resultado final da animação corrigida é idêntico ao estático v5. Entre observações há mistura contínua de imagens; não acompanhamos cada hifa individualmente. O vazio central vem do filtro do visualizador original, que remove ligações ao nó mais próximo do centro médio. Seu significado físico não foi confirmado. Não chamá-lo de inóculo ou recurso como fato.
- **Physarum:** é slime mold, não fungo. A identificação da foto do Facebook ficou em “Physarum sp.”, sem confirmação de espécie. O protótipo se inspira no modelo de adaptação de tubos de [Tero et al. (2010)](https://pubmed.ncbi.nlm.nih.gov/20093467/), partindo de uma malha existente. Não reproduz crescimento para fora, a foto ou o mapa de Tóquio.
- **Outros códigos:** [Mycorust](https://github.com/ezeoleaf/mycorust) e [Pycelium](https://github.com/ETancredi/pycelium) têm licença MIT. Não encontramos licença explícita no repositório de Neurospora. Conferir permissões antes de distribuir dados/fotos/código de terceiros no site. Referências de pesquisa local não são automaticamente assets de produção.

Os READMEs das versões guardam as demais fontes e referências de paleta. Manter as identificações incertas como incertas — por exemplo, a referência violeta de Lepista spp. não foi confirmada como L. nuda.

## Histórico preservado

- [v2](space-colonization-variations/v2/prototype.html): experimento histórico com nove cores, incluindo o verde luminoso depois rejeitado.
- [v4](space-colonization-variations/v4/prototype.html): malha e tufos; o usuário achou os desenhos estranhos. As regras extras eram interpretações próprias, não reproduções fiéis das fontes.
- [Diagnóstico do paper](space-colonization-variations/v5/paper-diagnostic/): tentativa de reconstrução mais angular que a referência, preservada para comparação.
- [v6 original](space-colonization-variations/v6/prototype.html): tinha transições bruscas; usar **v6-smooth** para avaliar a animação atual.

## Verificações e reprodução

Os estudos recentes já foram exercitados em navegador: pausa, replay, semente, escala e viewport mobile, conforme os registros de cada pasta. Nas medições locais ficaram próximos de 60 FPS. Isso não substitui teste em celular físico nem integração com os posts do site real.

Na Neurospora corrigida, a continuidade foi medida em 549 pares de quadros numa amostra reduzida de 360×225; a comparação final com v5 foi em 1440×900. Não extrapolar a medição reduzida para uma garantia de todos os pixels em resolução total.

Para **abrir** os previews, bastam os arquivos incluídos. Para **regenerar** imagens/vídeos, seguir o README de cada estudo; os scripts usam Node, Sharp e/ou Playwright. Alguns scripts históricos apontam para dependências temporárias e podem exigir ajuste. Não depender de caminhos antigos em `/private/tmp` ou imagens do clipboard.

## Demais entregas da sessão

Estado local conferido em 22/11: os três repositórios abaixo estavam limpos, em `main`, alinhados com suas referências locais `origin/main`. As publicações foram verificadas durante a sessão; o fechamento não fez novo deploy nem nova auditoria ao vivo.

| Projeto | Entrega publicada e confirmada pelo usuário | HEAD ao encerrar |
| --- | --- | --- |
| BMG | Recusa em lote corrigida; itens permanecem no grid com opacidade 0,2; loading sem alterar dimensões; ações independentes em outras fotos durante o processamento. | [4d9cdd1](https://github.com/gutobenn/bmg-static/commit/4d9cdd11befa9c64c55d89e7ddae2cf1f66a188a) |
| Fermentô | Texto após botão em linhas separadas no desktop e espaçamento corrigido junto de “CONTÉM GLÚTEN”. Resumo para o responsável em `docs/resumo-para-responsavel.txt` no repositório. | [7b44ad1](https://github.com/fermento-site/fermento/commit/7b44ad104700971f00c00aab2283548f0b14999f) |
| Fluxus | RSS PT/EN, ícone menor após idioma, modal explicativo com cópia do endereço sem “Abrir o feed”; limpeza dos detalhes antigos/administrativos do README. Micélio original restaurado. | [803cb2f](https://github.com/gutobenn/fluxusfungus/commit/803cb2fd5533d76f62afe3c251c8a613e81429c2) |

Repositórios locais em `/Users/augusto/Projects/Personal/`: `bmg-static`, `fermento` e `fluxusfungus`.

Mensagem pronta para Carol: “Carol, a recusa em lote foi corrigida; agora o loading não desloca a página, dá para moderar outras fotos enquanto aguarda e as processadas ficam mais esmaecidas no grid.”

Creative Commons no BMG: conversa exploratória; nenhuma licença ou fluxo de consentimento foi alterado. A decisão sobre direitos/autorização dos autores continua pendente.

Vic: foi aprovada a nossa versão do logo em lugar da original. A decisão está registrada no arquivo `output/jardim-de-papel/direcao-atual.json` da raiz deste workspace. O restante desse projeto é uma frente separada.

## Próxima sessão

1. Abrir o índice e comparar os leques de volta completa, as três famílias v3 e os cordões fúngicos.
2. Escolher famílias, paletas e frequência das variações. Decidir se Neurospora será apenas referência ou parte do site; manter Physarum separado dos fungos.
3. Integrar a seleção escolhida ao site em preview, incluindo posts/marcadores, navegação, redimensionamento, limpeza de animações e preferência por movimento reduzido.
4. Conferir desempenho e aparência no site real, desktop e celular. Rever permissões de referências/dados antes de incorporar assets externos.
5. Publicar **somente após aprovação explícita** da seleção e do preview integrado.

## Persistência

Os estudos e esta documentação foram preparados para commit e push na branch `chore/mycelium-studies-2026-11-22` do repositório `gutobenn/fluxusfungus`, a pedido do usuário. A branch preserva o trabalho sem integrar alterações à main nem ao micélio de produção. Consulte o histórico Git e a branch remota para confirmar a publicação do checkpoint. O ZIP original permanece apenas como cópia local no workspace de origem; não está versionado, pois duplicaria estes arquivos. `MANIFEST.sha256` registra a integridade dos arquivos desta pasta.

Prompt para a próxima conversa:

> Retome o trabalho do micélio do Fluxus Fungus lendo `docs/mycelium-studies/2026-11-22/RETOMADA.md` na branch `chore/mycelium-studies-2026-11-22` do repositório Fluxus Fungus. Abra o índice e comece pelos leques de volta completa e pela v3. Preserve os estudos e o micélio original em produção, baseline do arquivo 6e94ea4. Não publique nada; vamos escolher as variações finais.
