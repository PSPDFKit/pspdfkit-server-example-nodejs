# PSPDFKit Server Example – Node.js

This example shows how to integrate PSPDFKit Server and
[PSPDFKit for Web](https://pspdfkit.com/web/) into a Node.js / Express app.

## Prerequisites

* A PSPDFKit Server license. If you don't already have one
  you can [request a free trial here](https://pspdfkit.com/try/).

## Getting Started with Docker

### Prerequisites

* [Docker](https://www.docker.com/community-edition)

We recommend you use Docker to get all components up and running quickly.

The provided `docker-compose.yml` and `Dockerfile` will allow you to edit the example app on your
host and it will live-reload.

```sh
$ git clone https://github.com/PSPDFKit/pspdfkit-server-example-nodejs.git
$ cd pspdfkit-server-example-nodejs
$ ACTIVATION_KEY=YOUR_ACTIVATION_KEY_GOES_HERE docker-compose up
```

If you are using Windows make sure to set the environment variables accordingly. For this replace the line starting with `PSPDFKIT_ACTIVATION_KEY="...` with:

```shell
$ SET "PSPDFKIT_ACTIVATION_KEY"=YOUR_ACTIVATION_KEY_GOES_HERE
$ docker-compose up
```

Make sure to replace `YOUR_ACTIVATION_KEY_GOES_HERE` with your PSPDFKit Server activation key. You only have
to provide the activation key once, after that the server will remain activated until you reset it.

The example app is now running on <http://localhost:3000>. You can access PSPDFKit Server's
dashboard at <http://localhost:5000/dashboard> using `dashboard` // `secret`.

Upload a PDF via the button in the top-left, then click on the cover image to see PSPDFKit for Web
in action.

### Resetting the server

You can reset the server by first tearing down its containers and volumes and then recreating them.

```sh
$ docker-compose down --volumes
$ ACTIVATION_KEY=YOUR_ACTIVATION_KEY_GOES_HERE docker-compose up
```

If you are using Windows make sure to set the environment variables accordingly. For this replace the line starting with `PSPDFKIT_ACTIVATION_KEY="...` with:

```shell
$ SET "PSPDFKIT_ACTIVATION_KEY=YOUR_ACTIVATION_KEY_GOES_HERE"
$ docker-compose up
```

## Running the example locally

You can also run the example app directly on your machine, outside of a Docker container.

### Prerequisites

* [Node.js](http://nodejs.org/) (with NPM or [Yarn](https://yarnpkg.com/))
* [PSPDFKit Server](https://pspdfkit.com/guides/web/current/server-backed/setting-up-pspdfkit-server/)
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

## Contributing

Please ensure
[you signed our CLA](https://pspdfkit.com/guides/web/current/miscellaneous/contributing/) so we can
accept your contributions.
