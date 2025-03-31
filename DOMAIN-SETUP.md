# Domain Configuration for AICategoryHub

This document outlines the configuration steps for setting up the custom domain (aicategoryhub.net) with GitHub Pages.

## GitHub Repository Setup

1. CNAME file has been created in the root directory containing:
   ```
   aicategoryhub.net
   ```

## Namecheap DNS Configuration

Configure the following DNS records in your Namecheap account:

### A Records
Add the following A records pointing to GitHub Pages' IP addresses:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | 185.199.108.153 | Automatic |
| A | @ | 185.199.109.153 | Automatic |
| A | @ | 185.199.110.153 | Automatic |
| A | @ | 185.199.111.153 | Automatic |

### CNAME Record
Add the following CNAME record for the www subdomain:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| CNAME | www | esey-m.github.io | Automatic |

## GitHub Pages Settings

1. Go to your repository's Settings > Pages
2. Under "Custom domain", enter: aicategoryhub.net
3. Check "Enforce HTTPS" once the SSL certificate is provisioned

## Verification Steps

1. Wait for DNS propagation (can take up to 24 hours)
2. Verify HTTPS is working by visiting:
   - https://aicategoryhub.net
   - https://www.aicategoryhub.net

## Troubleshooting

If the site is not accessible:
1. Check DNS propagation using: https://dnschecker.org
2. Verify DNS records in Namecheap are correct
3. Ensure CNAME file exists in the repository
4. Check GitHub Pages settings for proper domain configuration

## Support

If you encounter any issues:
1. Check GitHub Pages documentation: https://docs.github.com/pages
2. Contact Namecheap support for DNS-related issues
3. Open an issue in this repository for site-specific problems 