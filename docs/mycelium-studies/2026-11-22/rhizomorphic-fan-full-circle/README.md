# Leques rizomórficos — volta completa

Abra **prototype.html**. Esta é uma variação offline nova. O seletor inclui **Leques abertos**, preservado em geometria e cronologia da v3, e **Leques · volta completa**, o novo padrão. Todas as pastas anteriores e o site permanecem intactos.

## O que significa fechar a volta

A nova colônia preenche todas as direções com leques que se abrem lateralmente desde perto da origem. Feixes e franjas vizinhas se sobrepõem, preenchendo a região intermediária e o núcleo; a borda continua irregular. Não desenhamos uma circunferência ou um aro, nem simulamos uma borda de placa.

O fechamento é **cobertura angular e encontro visual dos leques**, não uma alegação de anastomose celular ou uma aresta cíclica em forma de círculo. A geometria é gerada por ramificações e feixes curvos conectados às suas origens. Não acrescentamos uma imagem/disco opaco para pintar o núcleo. A variação conserva a linguagem de desenho dos leques anteriores, mas altera número, abertura proximal, ramificação lateral e densidade dos feixes.

A apresentação dura 41 segundos, com setores defasados e velocidade contínua ao longo dos ramos. Começa por uma parte da colônia e completa as outras direções aos poucos. A câmera é fixa; não há zoom automático, máscara radial ou troca de snapshots. O movimento e os intervalos de ativação são escolhas gráficas, não velocidades biológicas verificadas. A versão aberta mantém seus 31 segundos anteriores.

## Base visual e limites

A foto de colônia em placa enviada na conversa serviu como referência visual de leques densos, cordões proximais, núcleo e margem franjada. A espécie dessa foto não foi identificada.

[Dowson, Rayner e Boddy, 1986](https://www.davidmoore.org.uk/21st_century_guidebook_to_fungi_platinum/REPRINT_collection/Dowson_etal_mycelia_cord-forming_basidiomycetes.pdf), resultados, página 204, descreve nos controles sistemas persistentes, simétricos e radiantes de **Phanerochaete velutina** e **Hypholoma fasciculare**, alcançando bordas das bandejas em condições do experimento. O trabalho também descreve setores em leque em resposta a novos recursos.

Isso apoia a referência de crescimento em várias direções; não valida a forma exata, a cronologia dos setores ou os parâmetros deste desenho. **Não é uma nova espécie/variedade biológica, uma réplica da foto ou um modelo calibrado de H. fasciculare.** É uma variação artística generativa. As oito cores conservam suas referências separadas da morfologia; marfim é o padrão. Não há verde luminoso.

## Controles

Variação, gerar outra, replay, pausa, posição da animação, oito cores e escala 1×–3×. Cor/escala preservam o tempo. A escala é ancorada na origem e redesenha os filamentos na resolução final. Copiar/reproduzir JSON mantém semente, variação e cor.

## Verificações e reprodução

- `node build.mjs`: incorpora os módulos e gera HTML autocontido.
- `node verify.mjs`: confirma identidade dos leques abertos com a v3, determinismo, limites, continuidade/cronologia pai-filho e cobertura angular em três sementes.
- `SHARP_MODULE=/caminho/sharp/dist/index.mjs node render.mjs`: gera comparação e quadros do renderer procedural. Sem variável, importa sharp normalmente.
- `PLAYWRIGHT_MODULE=/caminho/playwright/index.mjs node check-browser.mjs`: controla a prévia real no Chrome, verifica estados, desktop/mobile e grava uma animação completa. Sem variável, importa playwright normalmente.

A cobertura é medida em 72 setores de 5° em três faixas radiais: 20–35%, 35–50% e 50–75% do raio máximo da colônia. As três sementes testadas cobrem 360° em todas essas faixas. Esse teste se soma à inspeção visual; não se resume a contar um raio isolado em cada direção. Valores, contagem mínima de nós por setor e maior intervalo angular vazio estão em coverage-checks.json. Nenhuma simulação biológica validada é inferida dessa métrica geométrica.

Os testes confirmam caminhos conectados e filhos iniciando após seus pais. A verificação do renderer limita o progresso ao intervalo [0,1], inclusive enquanto o cordão engrossa: a ponta nunca ultrapassa a extremidade geométrica final do segmento. O novo núcleo e os feixes mais densos chegam a aproximadamente 105 mil segmentos; o código evita Math.min/Math.max com spread de listas grandes, inclusive para Safari. O renderer mantém um cache de segmentos maduros e redesenha os ativos/em maturação.

Artefatos: images/comparison.png, images/full.png, images/fans.png, images/keyframes-draft.png e proof/. As imagens estáticas dos quadros usam a mesma geometria e tempos do protótipo; o vídeo é gravado do canvas real.
