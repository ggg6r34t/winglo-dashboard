# VPS Setup (Hetzner)

Covers provisioning, nginx, SSL, deployment, cron, and access control. Assumes Ubuntu 24.04 LTS.

---

## 1. Provision the server

Create a CX22 (2 vCPU / 4 GB RAM) in the Hetzner Cloud Console. Choose Ubuntu 24.04. Add your SSH public key during creation.

Once provisioned, SSH in as root:

```bash
ssh root@<server-ip>
```

Create a non-root user and grant sudo:

```bash
adduser deploy
usermod -aG sudo deploy
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
```

Switch to the deploy user for all remaining steps:

```bash
su - deploy
```

---

## 2. Install dependencies

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl nginx certbot python3-certbot-nginx ufw

# Node.js 22 via NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# PM2
sudo npm install -g pm2
```

---

## 3. Configure the firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 4. Clone and build the app

```bash
cd /home/deploy
git clone <your-repo-url> winglo
cd winglo
cp .env.local.example .env.local
```

Edit `.env.local` with your real values:

```bash
nano .env.local
```

Build and start:

```bash
npm install
npm run build
pm2 start npm --name "winglo" -- start
pm2 save
pm2 startup   # run the printed command with sudo to register PM2 on boot
```

Verify the app is running on port 3000:

```bash
curl http://localhost:3000
```

---

## 5. Configure nginx

Point your domain's A record at the server IP before this step.

Create the nginx site config:

```bash
sudo nano /etc/nginx/sites-available/winglo
```

Paste:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/winglo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. SSL with Let's Encrypt

```bash
sudo certbot --nginx -d yourdomain.com
```

Certbot edits the nginx config automatically and sets up auto-renewal. Verify renewal works:

```bash
sudo certbot renew --dry-run
```

---

## 7. Access control

The dashboard has no built-in authentication yet. Without access control, anyone who discovers the URL can use the full application. Two approaches are available — use HTTP Basic Auth now, and replace it with Supabase Auth when you are ready to open the app to more users.

### HTTP Basic Auth (current approach)

Adds a browser username/password prompt in front of the entire site. Takes about five minutes to set up and requires no code changes.

Install `apache2-utils` to get the `htpasswd` tool:

```bash
sudo apt install -y apache2-utils
```

Create a password file with your first user:

```bash
sudo htpasswd -c /etc/nginx/.htpasswd yourname
```

Add a second user (your friend) without the `-c` flag — that flag would overwrite the file:

```bash
sudo htpasswd /etc/nginx/.htpasswd friendsname
```

Both commands prompt for a password. To change a password for an existing user, run the same command again.

Edit the nginx site config to require authentication:

```bash
sudo nano /etc/nginx/sites-available/winglo
```

Add the two `auth_basic` lines inside the `location /` block:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        auth_basic           "Winglo";
        auth_basic_user_file /etc/nginx/.htpasswd;

        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

The cron endpoint must stay unauthenticated so the system cron job can reach it. Add a separate `location` block that bypasses Basic Auth for that path:

```nginx
    location /api/cron/ {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
```

The cron endpoint still requires the `CRON_SECRET` header, so bypassing Basic Auth there does not expose it.

Apply the changes:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

To remove a user later:

```bash
sudo htpasswd -D /etc/nginx/.htpasswd username
sudo systemctl reload nginx
```

### Supabase Auth (future implementation)

HTTP Basic Auth is a stopgap. When you are ready to support more users, named accounts, or role-based access, replace it with Supabase Auth. The codebase is already scaffolded for this — the work is wiring it up.

**What already exists:**

- `app/(auth)/login/page.tsx` — login page stub
- `lib/supabase/server.ts` — server-side Supabase client
- `lib/supabase/client.ts` — browser-side Supabase client
- `supabase/migrations/0002_rls_helpers.sql` — `set_org_context()` RLS helper
- `server/dal/` — all DAL functions accept `orgId` and are ready for org-scoped queries

**What needs to be built:**

1. **Auth flow** — implement sign-in/sign-up in `app/(auth)/login/page.tsx` using `supabase.auth.signInWithPassword()` or OAuth. Add a middleware file (`middleware.ts` at the project root) that redirects unauthenticated requests to `/login`.

2. **Session-to-org mapping** — add a `user_id` column to `organizations` (or a separate `org_members` join table), then look up the org from the session on every request.

3. **Replace `MOCK_ORG_ID`** — every server action and DAL call that currently hardcodes `MOCK_ORG_ID` needs to read `session.user.org_id` instead. Search for `MOCK_ORG_ID` across the codebase to find all call sites.

4. **Remove Basic Auth from nginx** — once the app handles auth itself, remove the `auth_basic` lines from the nginx config and reload.

Once these steps are done, the RLS policies in Supabase will automatically scope every database query to the authenticated org with no additional code.

---

## 9. Continuous monitoring cron

Add a system cron job to trigger discovery runs on a schedule:

```bash
crontab -e
```

Run every 6 hours and log the output:

```cron
0 */6 * * * curl -s -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/discovery >> /var/log/winglo-cron.log 2>&1
```

Replace `YOUR_CRON_SECRET` with the value in your `.env.local`. Adjust the schedule as needed — `*/2` for every 2 hours, `0 8 * * *` for once daily at 8 AM UTC.

### Log rotation

Prevent the log file from growing unbounded:

```bash
sudo nano /etc/logrotate.d/winglo-cron
```

Paste:

```
/var/log/winglo-cron.log {
    weekly
    rotate 4
    compress
    missingok
    notifempty
}
```

---

## 10. Deployment workflow

A simple deploy script for pushing updates:

```bash
nano /home/deploy/winglo/deploy.sh
```

Paste:

```bash
#!/bin/bash
set -e
cd /home/deploy/winglo
git pull origin main
npm install
npm run build
pm2 restart winglo
echo "Deploy complete"
```

Make it executable:

```bash
chmod +x /home/deploy/winglo/deploy.sh
```

To deploy from your local machine:

```bash
ssh deploy@<server-ip> '/home/deploy/winglo/deploy.sh'
```

### GitHub Actions (optional)

Create `.github/workflows/deploy.yml` to deploy automatically on push to `main`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: deploy
          key: ${{ secrets.VPS_SSH_KEY }}
          script: /home/deploy/winglo/deploy.sh
```

Add `VPS_HOST` (server IP) and `VPS_SSH_KEY` (private key for the deploy user) as repository secrets in GitHub.

---

## Quick reference

| What | Command |
|---|---|
| View app logs | `pm2 logs winglo` |
| Restart app | `pm2 restart winglo` |
| View cron log | `tail -f /var/log/winglo-cron.log` |
| Reload nginx | `sudo systemctl reload nginx` |
| Renew SSL | `sudo certbot renew` |
| Deploy update | `ssh deploy@<ip> '/home/deploy/winglo/deploy.sh'` |
| Add Basic Auth user | `sudo htpasswd /etc/nginx/.htpasswd username` |
| Remove Basic Auth user | `sudo htpasswd -D /etc/nginx/.htpasswd username` |
