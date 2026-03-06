# Bingo Game Admin Portal

This is a code bundle for Bingo Game Admin Portal. The original project is available at https://www.figma.com/design/wibJhMbzBYNq4EPuNoXPVg/Bingo-Game-Admin-Portal.

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.\\\\\\\\\

## Environment Setup

1. Copy `.env.example` to `.env`.
2. Put your private values (API URL and other sensitive runtime values) in `.env`.
3. Restart the dev server after changing env values.

Available variables:

- `VITE_API_BASE_URL` - backend API base URL (for example `http://localhost:8000/api`)
- `VITE_API_USE_MOCK` - `true` or `false`
- `VITE_API_TIMEOUT` - request timeout in milliseconds
- `VITE_API_RETRY_ATTEMPTS` - retry count for failed requests

## Public Cartella Checker

- Public checker UI route: `/public/cartella`
- The checker now sends `game_id` plus an array of cartella numbers to `POST /api/games/game/cartellas/check`
- Enter cartella numbers as comma-separated or space-separated values, for example `1, 5, 12`
- The response shows matching boards in `cartellas` and unknown requested numbers in `missing_cartella_numbers`
