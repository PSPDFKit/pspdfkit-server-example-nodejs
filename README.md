# Nutrient Document Engine Example – Node.js

This example shows how to integrate Nutrient Document Engine and
[Nutrient Web SDK](https://www.nutrient.io/sdk/web/) into a Node.js / Express app.

_Note: This example demonstrates the usage of Nutrient Web SDK in a Node.js application and is not optimized for production deployments. For information on how to set up Nutrient Web SDK in production, please refer to [our guides](https://www.nutrient.io/guides/document-engine/deployment/) instead._

## Prerequisites

We recommend you use Docker to get all components up and running quickly.

- [Docker](https://www.docker.com/community-edition)

You can easily run the example in trial mode without need for a license or activation key. Just make sure to check out this repository locally. The provided `docker-compose.yml` and `Dockerfile` will allow you to edit the example app on your host, and it will live-reload:

```sh
$ git clone https://github.com/PSPDFKit/pspdfkit-server-example-nodejs.git
$ cd pspdfkit-server-example-nodejs
$ docker compose up
```

The example is now running on [http://localhost:3000](http://localhost:3000). You can access the Nutrient Document Engine dashboard at [http://localhost:5000/dashboard](http://localhost:5000/dashboard) using `dashboard` // `secret`.

Upload a PDF via the button in the top-left, then click on the cover image to see Nutrient Web SDK in action.

## AI Assistant

This example also includes the [Nutrient AI Assistant](https://www.nutrient.io/sdk/ai-assistant), a powerful tool that enables you to extract information from documents using natural language queries. To activate the AI Assistant, you will need a valid OpenAI API key with sufficient credits. Follow these steps to get started:

1. Open a terminal and set the `OPENAI_API_KEY` environment variable with your OpenAI API key:

   ```sh
   $ OPENAI_API_KEY=YOUR_OPENAI_API_KEY_GOES_HERE docker compose up
   ```

2. Replace `YOUR_OPENAI_API_KEY_GOES_HERE` with your actual OpenAI API key.

Once the environment is running, you can add documents to the AI Assistant by clicking the "Add to AI Assistant" button. For more details about Nutrient AI Assistant and its capabilities, visit [our guide](https://www.nutrient.io/guides/ai-assistant/).

## Using a license

If you have a Nutrient Document Engine license you can use it as well by going through the following steps:

1.  Open the [`docker-compose.yml`](docker-compose.yml) file in an editor of your choice and replace the `YOUR_LICENSE_KEY_GOES_HERE` placeholder with your standalone license key.

2.  Start environment with your Nutrient Document Engine activation key:

```sh
$ ACTIVATION_KEY=YOUR_ACTIVATION_KEY_GOES_HERE docker compose up
```

If you are using Windows make sure to set the environment variables accordingly. For this replace the line starting with `ACTIVATION_KEY="...` with:

```shell
$ SET "ACTIVATION_KEY=YOUR_ACTIVATION_KEY_GOES_HERE"
$ docker compose up
```

Make sure to replace `YOUR_ACTIVATION_KEY_GOES_HERE` with your Nutrient Document Engine activation key. You only have to provide the activation key once, after that Document Engine will remain activated until you reset it.

And if you have an AI Assistant license, you can pass it in a similar way, by setting the `AIA_ACTIVATION_KEY` environment variable.

### Resetting the server

You can reset the server by first tearing down its containers and volumes and then recreating them.

```sh
$ docker compose down --volumes
$ docker compose up
```

If using an activation key, you'd need to set it again so as to recreate the containers:

```sh
$ docker compose down --volumes
$ ACTIVATION_KEY=YOUR_ACTIVATION_KEY_GOES_HERE docker compose up
```

If you are using Windows make sure to set the environment variables accordingly. For this replace the line starting with `ACTIVATION_KEY="...` with:

```shell
$ SET "ACTIVATION_KEY=YOUR_ACTIVATION_KEY_GOES_HERE"
$ docker compose up
```

## Running the example locally

You can also run the example app directly on your machine, outside of a Docker container.

### Prerequisites

- [Node.js](http://nodejs.org/)
- [Nutrient Document Engine](https://www.nutrient.io/getting-started/document-engine/)
  running on [http://localhost:5000](http://localhost:5000) with the default configuration

### Getting Started

```sh
$ git clone https://github.com/PSPDFKit/pspdfkit-server-example-nodejs.git
$ cd pspdfkit-server-example-nodejs
$ npm install
$ npm start
```

The example app is now running on <http://localhost:3000>.

Upload a PDF via the button in the top-left, then click on the cover image to see Nutrient Web SDK
in action.

You can quit the running containers with Ctrl-C.

If you want to test Nutrient Web SDK on different devices in your local network, you need
to edit the `DOCUMENT_ENGINE_EXTERNAL_URL` environment variable in the `docker-compose.yml` and set it to an address that's reachable from your device.

## Troubleshooting

Occasionally running the `docker compose` scripts will result in errors because some containers are in a broken state. To resolve this, you can reset all containers and their attached volumes by running the following command:

```sh
docker compose down --volumes
```

If you have further troubles, you can always reach out to us via our [support platform](https://support.nutrient.io/hc/requests/new).

## Support, Issues and License Questions

Nutrient offers support for customers with an active SDK license via https://support.nutrient.io/hc/requests/new

Are you [evaluating our SDK](https://www.nutrient.io/sdk/try)? That's great, we're happy to help out! To make sure this is fast, please use a work email and have someone from your company fill out our sales form: https://www.nutrient.io/contact-sales?=sdk

## License

This software is licensed under a [modified BSD license](LICENSE).

## Contributing

Please ensure
[you signed our CLA](https://www.nutrient.io/guides/web/miscellaneous/contributing/) so we can
accept your contributions.
