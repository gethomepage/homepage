
  
    
    
  



  A modern, fully static, fast, secure fully proxied, highly customizable application dashboard with integrations for over 100 services and translations into multiple languages. Easily configured via YAML files or through docker label discovery.



  



  
   
  
   
  
   
  
   
  



  


Homepage builds are kindly powered by DigitalOcean.


Features
With features like quick search, bookmarks, weather support, a wide range of integrations and widgets, an elegant and modern design, and a focus on performance, Homepage is your ideal start to the day and a handy companion throughout it.

Fast - The site is statically generated at build time for instant load times.
Secure - All API requests to backend services are proxied, keeping your API keys hidden. Constantly reviewed for security by the community.
For Everyone - Images built for AMD64, ARM64.
Full i18n - Support for over 40 languages.
Service & Web Bookmarks - Add custom links to the homepage.
Docker Integration - Container status and stats. Automatic service discovery via labels.
Service Integration - Over 100 service integrations, including popular starr and self-hosted apps.
Information & Utility Widgets - Weather, time, date, search, and more.
SSO Support - Optional Single Sign-On (SSO) with Keycloak for secure user authentication.
And much more...

Docker Integration
Homepage has built-in support for Docker, and can automatically discover and add services to the homepage based on labels. See the Docker Service Discovery page for more information.
Service Widgets
Homepage also has support for hundreds of 3rd-party services, including all popular *arr apps, and most popular self-hosted apps. Some examples include: Radarr, Sonarr, Lidarr, Bazarr, Ombi, Tautulli, Plex, Jellyfin, Emby, Transmission, qBittorrent, Deluge, Jackett, NZBGet, SABnzbd, etc. As well as service integrations, Homepage also has a number of information providers, sourcing information from a variety of external 3rd-party APIs. See the Service page for more information.
Information Widgets
Homepage has built-in support for a number of information providers, including weather, time, date, search, glances and more. System and status information presented at the top of the page. See the Information Providers page for more information.
Customization
Homepage is highly customizable, with support for custom themes, custom CSS & JS, custom layouts, formatting, localization and more. See the Settings page for more information.
Getting Started
For configuration options, examples and more, please check out the homepage documentation.
Security Notice 🔒
Please note that when using features such as widgets, Homepage can access personal information (for example from your home automation system) and Homepage currently does not (and is not planned to) include any authentication layer itself. Thus, we recommend homepage be deployed behind a reverse proxy including authentication, SSL etc, and / or behind a VPN. When enabling SSO with Keycloak, ensure secure configuration of your Keycloak instance and use HTTPS for all public-facing URLs.
With Docker
Using docker compose:
services:
  homepage:
    image: ghcr.io/gethomepage/homepage:latest
    container_name: homepage
    environment:
      HOMEPAGE_ALLOWED_HOSTS: gethomepage.dev # required, may need port. See gethomepage.dev/installation/#homepage_allowed_hosts
      PUID: 1000 # optional, your user id
      PGID: 1000 # optional, your group id
      # Optional SSO with Keycloak
      ENABLE_SSO: "true" # set to "false" to disable SSO
      NEXTAUTH_URL: http://localhost:3000 # or your public domain, e.g., https://homepage.example.com
      NEXTAUTH_SECRET: your-random-secret-string # generate a secure random string
      KEYCLOAK_CLIENT_ID: your-keycloak-client-id # e.g., homepage
      KEYCLOAK_CLIENT_SECRET: your-keycloak-client-secret # from Keycloak admin console
      KEYCLOAK_ISSUER: https://keycloak.example.com/realms/your-realm # e.g., https://keycloak.nydaforge.au/realms/master
    ports:
      - 3000:3000
    volumes:
      - /path/to/config:/app/config # Make sure your local config directory exists
      - /path/to/images:/app/public/images # Optional, for custom images
      - /var/run/docker.sock:/var/run/docker.sock:ro # optional, for docker integrations
    restart: unless-stopped

or docker run:
docker run -d --name homepage \
  -e HOMEPAGE_ALLOWED_HOSTS=gethomepage.dev \
  -e PUID=1000 \
  -e PGID=1000 \
  -e ENABLE_SSO=true \
  -e NEXTAUTH_URL=http://localhost:3000 \
  -e NEXTAUTH_SECRET=your-random-secret-string \
  -e KEYCLOAK_CLIENT_ID=your-keycloak-client-id \
  -e KEYCLOAK_CLIENT_SECRET=your-keycloak-client-secret \
  -e KEYCLOAK_ISSUER=https://keycloak.example.com/realms/your-realm \
  -p 3000:3000 \
  -v /path/to/config:/app/config \
  -v /path/to/images:/app/public/images \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  --restart unless-stopped \
  ghcr.io/gethomepage/homepage:latest

From Source
First, clone the repository:
git clone https://github.com/gethomepage/homepage.git

Then install dependencies and build the production bundle:
pnpm install
pnpm build

If this is your first time starting, copy the src/skeleton directory to config/ to populate initial example config files.
Finally, run the server in production mode:
pnpm start

Configuration
Please refer to the homepage documentation website for more information. Everything you need to know about configuring Homepage is there. Please read everything carefully before asking for help, as most questions are answered there or are simple YAML configuration issues.
Single Sign-On (SSO) with Keycloak
Homepage supports optional Single Sign-On (SSO) using Keycloak for secure user authentication. When enabled, users must log in via Keycloak to access the dashboard, with an optional password-based login fallback.
Prerequisites

A running Keycloak instance (e.g., https://keycloak.example.com).
A Keycloak realm (e.g., master) with a configured client (e.g., homepage).
Access to the Keycloak admin console to configure the client.

Configuration Steps

Set Up Keycloak Client:

In the Keycloak admin console, create a new client in your realm:
Client ID: e.g., homepage
Access Type: confidential
Valid Redirect URIs: https://your-homepage-domain/api/auth/callback/keycloak (e.g., https://dash.nydaforge.au/api/auth/callback/keycloak)
Web Origins: https://your-homepage-domain (e.g., https://dash.nydaforge.au)


Copy the Client Secret from the Credentials tab.


Configure Environment Variables:

Set the following in your docker-compose.yml, docker run command, or .env file:
ENABLE_SSO: Set to true to enable SSO, false to disable (default: false).
NEXTAUTH_URL: The public URL of your Homepage instance (e.g., https://dash.nydaforge.au).
NEXTAUTH_SECRET: A random, secure string for signing sessions (e.g., generate with openssl rand -base64 32).
KEYCLOAK_CLIENT_ID: Your Keycloak client ID (e.g., homepage).
KEYCLOAK_CLIENT_SECRET: The client secret from Keycloak.
KEYCLOAK_ISSUER: The Keycloak issuer URL (e.g., https://keycloak.example.com/realms/master).




Docker Volume for Configuration:

Mount a local directory to /app/config to persist configuration files (e.g., settings.yaml, services.yaml).
Example: -v /path/to/config:/app/config


Optional Password-Based Auth:

When ENABLE_SSO=true, a password-based login option is available as a fallback.
To disable password-based auth and use Keycloak only, modify src/components/auth/LoginForm.jsx to remove the password form.



Example Docker Run Command
docker run -d --name homepage \
  -e HOMEPAGE_ALLOWED_HOSTS=dash.nydaforge.au \
  -e ENABLE_SSO=true \
  -e NEXTAUTH_URL=https://dash.nydaforge.au \
  -e NEXTAUTH_SECRET=your-random-secret-string \
  -e KEYCLOAK_CLIENT_ID=homepage \
  -e KEYCLOAK_CLIENT_SECRET=your-keycloak-client-secret \
  -e KEYCLOAK_ISSUER=https://keycloak.nydaforge.au/realms/master \
  -p 3000:3000 \
  -v /path/to/config:/app/config \
  -v /path/to/images:/app/public/images \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  --restart unless-stopped \
  ghcr.io/gethomepage/homepage:latest

Notes

Security: Use HTTPS for NEXTAUTH_URL and KEYCLOAK_ISSUER in production to protect user data.
Keycloak Admin Console: Ensure the client’s redirect URI and web origins match your NEXTAUTH_URL.
Disabling SSO: Set ENABLE_SSO=false to revert to unauthenticated access or password-based auth only.
Troubleshooting: Check container logs (docker logs homepage) and browser console for errors. Verify Keycloak’s .well-known/openid-configuration endpoint (e.g., curl https://keycloak.example.com/realms/master/.well-known/openid-configuration).

Development
Install NPM packages, this project uses pnpm (and so should you!):
pnpm install

Start the development server:
pnpm dev

Open http://localhost:3000 to start.
This is a Next.js application, see their documentation for more information.
Documentation
The homepage documentation is available at https://gethomepage.dev/.
Homepage uses Material for MkDocs for documentation. To run the documentation locally, first install the dependencies:
pip install -r requirements.txt

Then run the development server:
mkdocs serve # or build, to build the static site

Support & Suggestions
If you have any questions, suggestions, or general issues, please start a discussion on the Discussions page.
Troubleshooting
In addition to the docs, the troubleshooting guide can help reveal many basic config or network issues. If you're having a problem, it's a good place to start.
Contributing & Contributors
Contributions are welcome! Please see the CONTRIBUTING.md file for more information.
Thanks to the over 200 contributors who have helped make this project what it is today!
Especially huge thanks to @shamoon, who has been the backbone of this community from the very start.
