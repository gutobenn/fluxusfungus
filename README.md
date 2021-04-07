# fluxus fungus

Web client of [fluxus fungus](https://fluxusfungus.com). The API code is available at [gutobenn/fluxusfungus-api](https://github.com/gutobenn/fluxusfungus-api).

## Development
Copy the `.env.local.example` file in this directory to `.env.local` (which will be ignored by Git):

```bash
cp .env.local.example .env.local
```

Then set each variable on `.env.local`:

- `NEXT_PUBLIC_STRAPI_API_URL` should be set as `http://localhost:1337` (no trailing slash).

Now let's run the project. Make sure the local Strapi server ([API](https://github.com/gutobenn/fluxusfungus-api)) is running at http://localhost:1337.

```bash
npm install
npm run dev
```


## Exportação MAC-PR
Devido à incompatibilidade do 'next export' com o i18n nativo, optamos por fazer uma exportação para cada idioma e juntar todas no final.
1. Editar os componentes header, meta e sketch para sobrescrever o valor de router.locale
2. Gerar versão estática: `npm run build` seguido de `npm run export`
3. Reunir em um único arquivo (`urls_to_download.txt`) as URLs de todos os assets externos (static.fluxusfungus.com e res.cloudinary.com) que devem passar a serem carregador localmente. Coloque uma por linha
4. Para baixar os assets, crie um diretório (`mkdir public/static/3rd-assets`) e execute `wget -x -i urls_to_download.txt -O public/static/3rd-assets`
5. Ajustar as URLs de assets externos. 
```
cd out
find ./ -type f -exec sed -i -e 's@https://res.cloudinary@/BASE_PATH_HERE/static/3rd-assets/res.cloudinary@g' {} \;
find ./ -type f -exec sed -i -e 's@https://static.fluxusfungus.com@/BASE_PATH_HERE/static/3rd-assets/static.fluxusfungus.com@g' {} \;
# ! Ajuste o 'out' do próximo comando para o valor adequado antes de executá-lo
find ./ -type f -exec sed -i -e 's@BASE_PATH_HERE@out@g' {} \;    
# ! Ajuste o path do comando abaixo antes de executá-lo
find ./ -type f -exec sed -i -e 's@localhost:3000@dominio.com/out@g' {} \;    
```
