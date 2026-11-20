# fluxus fungus

Site do [fluxusfungus.com](https://fluxusfungus.com), projeto da artista visual Tuane Eggers.

Desde 2026-11 o site é estático, na Cloudflare, sem custo. Ele substitui o Next.js na Vercel, o Strapi no Northflank ([gutobenn/fluxusfungus-api](https://github.com/gutobenn/fluxusfungus-api)) e as imagens no Cloudinary. O histórico deste repositório guarda a versão Next.js (2020–2022).

## Como funciona

- **Astro** gera HTML estático (`src/`). A página inicial é o desenho do micélio em p5 (`src/scripts/mycelium.js`), igual ao site antigo. Cada nó abre um item numa janela.
- **Conteúdo em arquivos:** um YAML por item em `src/content/items/`, e as páginas "sobre" e "contaminações" em `src/content/pages/`. As imagens ficam em `src/assets/uploads/`, e o Astro gera as versões WebP no build.
- **Editor:** [Pages CMS](https://app.pagescms.org), configurado em `.pages.yml`. Cada edição salva vira um commit na `main`.
- **Publicação:** a Cloudflare (Workers Builds) faz o build a cada push na `main` e publica o Worker `fluxusfungus`, na conta "Fluxus Fungus". O Worker só serve arquivos estáticos.
- **Endereços antigos mantidos:** `/p/<id>`, `/sobre`, `/contaminacoes` e as versões em inglês em `/en/...`. Os arquivos de `static.fluxusfungus.com` (PDF e MP3) ficam na raiz do site.

## Editar o conteúdo

1. Entre em https://app.pagescms.org com a conta do GitHub, ou pelo convite por e-mail.
2. Abra o repositório `fluxusfungus`.
3. **Itens do micélio:** cada item é uma galeria de imagens, uma citação, um vídeo (Vimeo ou YouTube) ou um áudio (MP3). Os campos `(pt)` e `(en)` são as duas línguas. Desmarque "Mostrar no site em …" para esconder um item numa língua.
4. **Salvar** publica o site em cerca de um minuto.

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
