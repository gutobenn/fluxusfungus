# fluxus fungus

Site do [fluxusfungus.com](https://fluxusfungus.com), projeto da artista visual Tuane Eggers.

Desde 2026-11 o site é estático, na Cloudflare, sem custo. Ele substitui o Next.js na Vercel, o Strapi no Northflank ([gutobenn/fluxusfungus-api](https://github.com/gutobenn/fluxusfungus-api)) e as imagens no Cloudinary. O histórico deste repositório guarda a versão Next.js (2020–2022).

## Como funciona

- **Astro** gera HTML estático (`src/`). A página inicial é o desenho do micélio em p5 (`src/scripts/mycelium.js`), igual ao site antigo. Cada nó abre um item numa janela.
- **Conteúdo em arquivos:** um YAML por item em `src/content/items/`, e as páginas "sobre" e "contaminações" em `src/content/pages/`. As imagens ficam em `src/assets/uploads/`, e o Astro gera as versões WebP no build.
- **Editor:** [Pages CMS](https://app.pagescms.org), configurado em `.pages.yml`. Cada edição salva vira um commit na `main`.
- **Publicação:** a Cloudflare (Workers Builds) faz o build a cada push na `main` e publica o Worker `fluxusfungus`, na conta "Fluxus Fungus". O Worker só serve arquivos estáticos.
- **Endereços antigos mantidos:** `/p/<id>`, `/sobre`, `/contaminacoes` e as versões em inglês em `/en/...`. Os arquivos de `static.fluxusfungus.com` (PDF e MP3) ficam na raiz do site. A exceção é o MP3 do Luiz Bruno, que foi para `public/audio/`. O endereço antigo dele redireciona para o novo (`public/_redirects`).

## Domínio e e-mail

- **Domínio:** `fluxusfungus.com` fica na conta "Fluxus Fungus" da Cloudflare. O registrador é a Squarespace Domains, e o domínio expira em 2027-10-01.
- **Endereços:** `fluxusfungus.com`, `www.fluxusfungus.com` e `static.fluxusfungus.com` apontam para o Worker (`routes` em `wrangler.jsonc`).
- **E-mail:** o Cloudflare Email Routing repassa `esporos@fluxusfungus.com`, o endereço de contribuições da página "contaminações", para a caixa da Tuane. E-mails para outros endereços `@fluxusfungus.com` são recusados. A regra fica em Email → Email Routing.

## Editar o conteúdo

1. Entre em https://app.pagescms.org com a conta do GitHub, ou pelo convite por e-mail.
2. Abra o repositório `fluxusfungus`.
3. **Itens do micélio:** cada item é uma galeria de imagens, uma citação, um vídeo (Vimeo ou YouTube) ou um áudio (MP3). Os campos `(pt)` e `(en)` são as duas línguas. Desmarque "Mostrar no site em …" para esconder um item numa língua. Galerias, vídeos e áudios têm "Legenda" e "Crédito", onde vai o "[esporo enviado por …]".
   - **Áudio:** o MP3 fica em `public/audio/`, e o item o escolhe na lista de "Áudios". O Pages CMS só envia arquivos de até 3 MB, mais ou menos ([limite da Vercel](https://github.com/hunvreus/pagescms/issues/393)). Um MP3 maior, até 25 MB, vai pelo GitHub: abra a pasta `public/audio` do repositório e use Add file → Upload files. Depois, ele aparece na lista do Pages CMS.
4. **Salvar** publica o site em até 2 minutos.
5. **Endereço:** cada item tem um número, como no site antigo (`fluxusfungus.com/p/26`). Um item novo é salvo com um nome provisório, e a GitHub Action "Assign item ids" (`scripts/assign-item-ids.mjs`) dá a ele o próximo número e preenche o campo "Link no site". Isso leva até 2 minutos, e só então o item aparece no site. Não renomeie os arquivos: o nome é o endereço.
6. **Data:** o dia em que o item entrou no site. Um item novo começa com a data de hoje, e dá para mudar. Os itens antigos têm a data de criação no Strapi, tirada do backup do banco de 2026-11-20. Se um item ficar sem data, a mesma Action coloca a data do dia. Por enquanto, o site não mostra a data.

Imagens grandes não são problema: o build gera as versões menores. Prefira JPEG.

## Rodar localmente

Requisitos: Node 24 (`.nvmrc`) e pnpm.

```sh
pnpm install --frozen-lockfile
pnpm dev          # http://localhost:4321
pnpm preview      # build + o servidor da Cloudflare, em http://localhost:8787
```

## Importação do site antigo

`scripts/import/from-live.mjs` leu o site publicado em 2026-11-20, porque a API do Strapi já estava fora do ar. O script converteu o HTML das citações de volta para Markdown e baixou os originais do Cloudinary. Ele não precisa rodar de novo.
