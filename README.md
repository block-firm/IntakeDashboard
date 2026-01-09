# HubSpot Conversion Tracker Dashboard

A live, aesthetic dashboard that integrates with Google Sheets (via Coefficient) to display real-time HubSpot conversion data. Built with React, Tailwind CSS, and a modern Glassmorphic design.

![Dashboard Preview](client/public/images/glassmorphic-bg-1.jpg)

## Features

- **Live Data Integration**: Connects directly to any published Google Sheet CSV export.
- **Real-Time Updates**: Auto-refreshes data every 60 seconds.
- **Glassmorphic Design**: Modern, high-tech aesthetic with frosted glass effects and neon accents.
- **Interactive Visualizations**:
  - Revenue & Leads Trend (Area Chart)
  - Revenue by Source (Pie Chart)
  - Detailed Transaction Table
- **Responsive**: Works perfectly on desktop, tablet, and mobile.

## How to Connect Your Data

1. **Prepare Your Google Sheet**:
   - Ensure your sheet has columns like: `Date`, `Source`, `Visitors`, `Leads`, `Customers`, `Revenue`.
   - Use Coefficient to sync your HubSpot data into this sheet automatically.

2. **Publish to Web**:
   - In Google Sheets, go to **File > Share > Publish to web**.
   - Select "Entire Document" (or specific sheet) and "Comma-separated values (.csv)".
   - Click **Publish**.

3. **Get the Sheet ID**:
   - Copy the Sheet ID from your browser URL (the long string between `/d/` and `/edit`).
   - Example: `https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit` -> ID is `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`.

4. **Configure Dashboard**:
   - Open the dashboard.
   - Click the **Settings (Gear Icon)** in the top right.
   - Paste your Sheet ID and click **Connect**.

## How to Deploy to GitHub Pages

This project is ready to be hosted for free on GitHub Pages.

### Step 1: Create a Repository
1. Go to [GitHub.com](https://github.com) and create a new repository (e.g., `conversion-dashboard`).
2. Do not initialize with a README, .gitignore, or license.

### Step 2: Push Code
Run these commands in your project folder:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/conversion-dashboard.git
git push -u origin main
```

### Step 3: Configure GitHub Pages
1. Go to your repository **Settings > Pages**.
2. Under **Build and deployment**, select **GitHub Actions**.
3. Create a new workflow file `.github/workflows/deploy.yml` with the content below.

### GitHub Actions Workflow (`.github/workflows/deploy.yml`)

Create this file in your repository to automate deployment:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install and Build
        run: |
          npm install
          npm run build

      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: dist
```

Once you push this file, GitHub will automatically build and deploy your dashboard!

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the dev server:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:5173` in your browser.
