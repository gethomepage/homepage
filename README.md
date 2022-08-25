![Homepage Preview](/images/preview.png)

## Getting Started

Using docker compose:

```yaml
version: '3.3'
services:
    homepage:
        image: ghcr.io/benphelps/homepage:main
        container_name: homepage
        ports:
            - 3000:3000
        volumes:
            - /path/to/config:/app/config
```

or docker run:

```bash
docker run -p 3000:3000 -v /path/to/config:/app/config ghcr.io/benphelps/homepage:main
```

## Configuration

Configuration files will be genereted and placed on the first request.

Configuration is done in the /config directory using .yaml files.  Refer to each config for
the specific configuration options.

## Development

Install NPM packages, this project uses [pnpm](https://pnpm.io/) (and so should you!):

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to start.
