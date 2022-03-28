# PSPDFKit Server Example – Node.js

This example shows how to integrate PSPDFKit Server and
[PSPDFKit for Web](https://pspdfkit.com/web/) into a Node.js / Express app.

_Note: This example demonstrates the usage of PSPDFKit for Web in a Node.js application and is not optimized for production deployments. For information on how to set up PSPDFKit for Web in production, please refer to [our guides](https://pspdfkit.com/guides/server/current/deployment/getting-started/) instead._

## Prerequisites

We recommend you use Docker to get all components up and running quickly.

- [Docker](https://www.docker.com/community-edition)

You can easily run the example in trial mode without need for a license or activation key. Just make sure to check out this repository locally. The provided `docker-compose.yml` and `Dockerfile` will allow you to edit the example app on your host, and it will live-reload:

```sh
$ git clone https://github.com/PSPDFKit/pspdfkit-server-example-nodejs.git
$ cd pspdfkit-server-example-nodejs
$ docker-compose up
```

The example is now running on [http://localhost:3000](http://localhost:3000). You can access the PSPDFKit Server dashboard at [http://localhost:5000/dashboard](http://localhost:5000/dashboard) using `dashboard` // `secret`.

Upload a PDF via the button in the top-left, then click on the cover image to see PSPDFKit for Web in action.

## Using a license

If you have a PSPDFKit Server license you can use it as well by going through the following steps:

1.  Open the [`docker-compose.yml`](docker-compose.yml) file in an editor of your choice and replace the `YOUR_LICENSE_KEY_GOES_HERE` placeholder with your standalone license key.

2.  Start environment with your PSPDFKit Server activation key:

```sh
$ ACTIVATION_KEY=YOUR_ACTIVATION_KEY_GOES_HERE docker-compose up
```

If you are using Windows make sure to set the environment variables accordingly. For this replace the line starting with `ACTIVATION_KEY="...` with:

```shell
$ SET "ACTIVATION_KEY=YOUR_ACTIVATION_KEY_GOES_HERE"
$ docker-compose up
```

Make sure to replace `YOUR_ACTIVATION_KEY_GOES_HERE` with your PSPDFKit Server activation key. You only have to provide the activation key once, after that the server will remain activated until you reset it.

### Resetting the server

You can reset the server by first tearing down its containers and volumes and then recreating them.

```sh
$ docker-compose down --volumes
$ docker-compose up
```

If using an activation key, you'd need to set it again so as to recreate the containers:

```sh
$ docker-compose down --volumes
$ ACTIVATION_KEY=YOUR_ACTIVATION_KEY_GOES_HERE docker-compose up
```

If you are using Windows make sure to set the environment variables accordingly. For this replace the line starting with `ACTIVATION_KEY="...` with:

```shell
$ SET "ACTIVATION_KEY=YOUR_ACTIVATION_KEY_GOES_HERE"
$ docker-compose up
```

## Running the example locally

You can also run the example app directly on your machine, outside of a Docker container.

### Prerequisites

- [Node.js](http://nodejs.org/)
- [PSPDFKit Server](https://pspdfkit.com/guides/web/current/server-backed/setting-up-pspdfkit-server/)
  running on [http://localhost:5000](http://localhost:5000) with the default configuration

### Getting Started

```sh
$ git clone https://github.com/PSPDFKit/pspdfkit-server-example-nodejs.git
$ cd pspdfkit-server-example-nodejs
$ npm install
$ npm start
```

The example app is now running on <http://localhost:3000>.

Upload a PDF via the button in the top-left, then click on the cover image to see PSPDFKit for Web
in action.

You can quit the running containers with Ctrl-C.

If you want to test PSPDFKit for Web on different devices in your local network, you need
to edit the `PSPDFKIT_SERVER_EXTERNAL_URL` environment variable in the `docker-compose.yml` and set it to an address that's reachable from your device.

## Troubleshooting

Occasionally running the `docker-compose` scripts will result in errors because some containers are in a broken state. To resolve this, you can reset all containers and their attached volumes by running the following command:

```sh
docker-compose down --volumes
```

If you have further troubles, you can always reach out to us via our [support platform](https://pspdfkit.com/support/request).

## Support, Issues and License Questions

PSPDFKit offers support for customers with an active SDK license via https://pspdfkit.com/support/request/

Are you [evaluating our SDK](https://pspdfkit.com/try/)? That's great, we're happy to help out! To make sure this is fast, please use a work email and have someone from your company fill out our sales form: https://pspdfkit.com/sales/

## License

This software is licensed under a [modified BSD license](LICENSE).

## Contributing

Please ensure
[you signed our CLA](https://pspdfkit.com/guides/web/current/miscellaneous/contributing/) so we can
accept your contributions.
