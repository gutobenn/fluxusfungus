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
