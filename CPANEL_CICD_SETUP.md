# cPanel CI/CD Setup (Frontend - Vite/React)

This deploys the frontend automatically from GitHub to cPanel shared hosting whenever you push to `main`.

## 1. What Was Created

- Workflow: `.github/workflows/deploy-cpanel.yml`
- SPA routing file: `public/.htaccess`

## 2. GitHub Secrets (Only 3 Required)

In GitHub repo settings for `LuluBingo_Front_End`:
`Settings -> Secrets and variables -> Actions -> New repository secret`

Create these **exact** names:

- `CPANEL_HOST`
- `CPANEL_USERNAME`
- `CPANEL_PASSWORD`

### Fill This Table

| Secret Name     | What to put                   | Example                |
| --------------- | ----------------------------- | ---------------------- |
| CPANEL_HOST     | FTP/FTPS hostname from cPanel | `ftp.yourdomain.com`   |
| CPANEL_USERNAME | cPanel account username       | `lulubingo`            |
| CPANEL_PASSWORD | cPanel account password       | `your-cpanel-password` |

## 3. Frontend Environment on GitHub (Build-Time)

If your build needs production API URL, add repository variable or secret and map it in workflow.

Recommended approach:

1. Add repository variable: `VITE_API_BASE_URL`
2. Update workflow build step to export it.

Example build step:

```yaml
- name: Build frontend
  env:
    VITE_API_BASE_URL: ${{ vars.VITE_API_BASE_URL }}
  run: npm run build
```

Current workflow already builds with default repo settings; add the above only if needed.

## 4. How Deploy Works

- Trigger: push to `main`
- Build command: `npm ci && npm run build`
- Upload target: `/home/${CPANEL_USERNAME}/public_html/`

## 5. SPA Routing

`public/.htaccess` is included so direct route refreshes (like `/playground`) work on Apache/cPanel.

## 6. Verify Deployment

1. In GitHub Actions, confirm workflow passed.
2. Open your site URL in browser.
3. Test hard refresh on deep routes (`/playground`, `/public/cartella`).

## 7. If Deploy Fails

- Wrong host: update `CPANEL_HOST`.
- Login denied: verify `CPANEL_USERNAME` and `CPANEL_PASSWORD`.
- Blank page/API errors: set correct `VITE_API_BASE_URL` and redeploy.
