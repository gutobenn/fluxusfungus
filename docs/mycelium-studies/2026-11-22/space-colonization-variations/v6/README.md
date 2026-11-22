# Neurospora — registros animados, v6 offline

Abra **prototype.html** diretamente no navegador. São dez registros da **mesma rede medida**, não uma nova rede gerada nem uma simulação. O desenho final é idêntico ao renderer estático da v5. v3/v4/v5 e o site permanecem intactos.

## Dados e cronologia

Fonte: [Animated Fungal Network Growth](https://github.com/synosys/animated-fungal-network-growth), commit [2fd578d8adbb749dbb7b609291b9e9112b5968cc](https://github.com/synosys/animated-fungal-network-growth/tree/2fd578d8adbb749dbb7b609291b9e9112b5968cc/data/neurospora). A lista de quadros foi conferida no timeSteps.js original. Seleção espaçada: 745A6193, 6216, 6239, 6262, 6285, 6308, 6331, 6354, 6377, 6398. Baixados somente spatial/edges destes dez registros: 20 CSVs, 3.533.380 bytes. O último foi copiado do arquivo original já coletado; todos estão em data/ com manifesto do commit.

Os números ordenam os registros, mas não verificamos horários ou intervalo biológico entre eles. Os **36 segundos são ritmo de apresentação**, não tempo real ou uma medida da velocidade do fungo. Não identificamos espécie além do gênero informado nos dados.

Os IDs de nós não persistem: deslocamentos medianos entre a mesma numeração em quadros consecutivos selecionados são 218–672 pixels. Portanto, não usamos IDs como rastreamento. As coordenadas compartilham o mesmo campo; os limites se expandem coerentemente. Não foi aplicada translação, alinhamento estimado ou auto-fit por registro. A câmera usa os limites e as escalas x/y do quadro final da v5, desde o primeiro instante. O controle1×–3× é manual e não interfere no relógio.

## Interpolação de apresentação

1. Cada quadro mantém suas coordenadas e arestas originais. Como no renderer original, ocultamos o nó mais próximo da média de posições e as arestas conectadas a ele, em cada registro. No último são98arestas ocultadas e8.103visíveis.
2. Pontos do novo quadro a até13pixels de uma aresta anterior são âncoras geométricas aproximadas; isso **não prova identidade de uma hifa**. Não deformamos os endpoints para forçar correspondência.
3. Distâncias ao longo do grafo do novo quadro determinam a ordem de revelação a partir dessas âncoras. Novas arestas são traçadas parcialmente, e correções na rede anterior se dissolvem numa transição curta. Nada é ampliado automaticamente nem revelado por uma máscara circular.
4. Algumas componentes novas não possuem predecessor próximo, sobretudo nos primeiros registros (9 e12componentes nas duas primeiras transições). Elas surgem de forma gradual no local observado, sem inventar conexões ou afirmar uma linhagem. A ordem e o movimento entre registros são **interpolação artística**, não reconstituição experimental de cada ponta.

correspondence.json registra contagens, âncoras, exceções e deslocamento de IDs por transição. animation-data.json contém os dados de apresentação compilados; os CSVs permanecem intactos.

## Controles e referências

Pausa/continuar, replay, posição da apresentação, oito cores e escala1×–3×. Cor/escala preservam tempo e geometria. Replay preserva as escolhas. Marfim é o padrão; as notas de cor mantêm as referências dos estudos anteriores. Não há semente, novos desenhos aleatórios, ponto inicial ou marcadores inventados.

O parser, a correspondência geométrica, a apresentação e o renderer são independentes; não copiamos o bundle do projeto. Nenhuma licença geral explícita foi encontrada no projeto fonte. Dados e capturas permanecem referências para estudo local, sem integração/publicação no site.

## Reproduzir

- `python3 download-data.py`: coleta os20arquivos do commit fixo (precisa de rede; reutiliza arquivos já presentes).
- `node build.mjs`: recompila dados, relatório de correspondência e HTML autocontido, sem rede.
- `PLAYWRIGHT_MODULE=/caminho/playwright/index.mjs SHARP_MODULE=/caminho/sharp/dist/index.mjs node check-browser.mjs`: smoke dirigido dos controles, desktop/mobile, quadros e igualdade pixel a pixel com o final da v5. Sem variáveis, usa os módulos instalados normalmente.

`PLAYWRIGHT_MODULE=/caminho/playwright/index.mjs node record-browser.mjs` grava a apresentação real de36s no Chrome em proof/observed-network.webm. O MP4 é uma conversão desse vídeo, sem alterar a animação.

Resultados em proof/; nenhum asset requer rede ao abrir a prévia.
