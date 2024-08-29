# Kong Manager OSS

[Installation](#getting-started) | [Provide feedback](https://github.com/Kong/kong-manager/issues/new/choose) | [Ask a question](https://join.slack.com/t/kongcommunity/shared_invite/zt-1s4nb74vo-jLdMEk8MoTm~uMWYMMLPWg) | [Contributing](#contributing) | [Blog](https://konghq.com/blog)

![Kong Manager OSS - Plugin list](./media/Plugin%20list.png)

Kong Manager OSS, a **free** and **open-source** UI for [Kong](https://github.com/kong/kong), the world's most used open source API Gateway.

Built and maintained with ❤️ by the team at Kong.

## Features

Kong Manager OSS allows you to view and edit all Kong Gateway objects using the admin API. It interacts directly with the Kong admin API and does not require a separate database.

![Kong Manager OSS - Service edit](./media/Service%20edit.png)

> **Important:** Kong Manager OSS is only compatible in Kong Gateway 3.4+

Kong Manager OSS is bundled with Kong Gateway, see [Getting Started](#getting-started) for information on how to use it. To run Kong Manager OSS locally, please see the [contributing](#contributing) section.

## Getting Started

To use Kong Manager OSS you'll need a running Kong Gateway instance. This can be a local instance or running on a remote server.

### Local testing

The quickest way to get started is using the quickstart script:

```bash
curl -Ls https://get.konghq.com/quickstart | bash -s -- -i kong -t latest
```

Finally, visit https://localhost:8002 to view Kong Manager.

### Server usage

Kong Manager OSS is intended to be a local testing tool. However, you can also use it on a public server.

> If running Kong Manger OSS on a public server, ensure that ports `8001` and `8002` are only accessible to your IP address

To access Kong Manager OSS from a remote machine, ensure that `admin_listen` and `admin_gui_listen` are binding to `0.0.0.0` rather than `127.0.0.1` in `kong.conf` and restart your Kong Gateway instance.

## Why do I need this?

You've been using the admin API just fine for years. Why would you want to use a UI?

Kong Manager OSS is a great way to see your Kong Gateway configuration at glance. You can see the routes and plugins configured on a service and drill in to the configuration of each in a single click.

In addition, the plugin configuration UI provides instructions for each configuration option. You can configure a plugin using the UI with helpful tooltips before running `deck dump` to see the final configuration values.

![Kong Manager OSS - Plugin configuration tooltip](./media/Plugin%20configuration%20tooltip.png)

## Contributing

Kong Manager OSS is written in JavaScript. It uses Vue for it's UI components, and `pnpm` for managing dependencies. To build Kong Manager OSS locally please ensure that you have `node.js 18+` and `pnpm` installed.

You'll also need a running Kong Gateway instance. See [local testing](#local-testing) for a one-line solution. Alternatively, you can [build Kong Gateway from source](https://github.com/Kong/kong/tree/master/build).

Once Kong Gateway is running, run the following command to start the development server:

```bash
pnpm && pnpm serve
```

Kong Manager OSS is now available at http://localhost:8080
