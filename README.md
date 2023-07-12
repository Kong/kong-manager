# Kong Manager Open Source

Kong Manager Open Source is a graphical user interface (GUI) for Kong Gateway. It uses Admin API under the hood to administer and control the Gateway.

## Getting Started

Kong Manager Open Source comes with [Kong Gateway](https://github.com/Kong/kong) 3.4 or later. To start, you need to start Kong Gateway. You may find all supported distributions or platforms and follow the steps in the [_Install Kong Gateway_ section](https://konghq.com/install#kong-community) on our documentation website.

After starting the Gateway, the 8002 port on localhost should be accessible by default. You can visit [http://localhost:8002/](http://localhost:8002/) in your browser and start exploring.

Furthermore, you could also find [helpful tutorials and quick-start guides](https://docs.konghq.com/gateway/latest/get-started/#main) on our documentation website.

## Contributing

> Note: This section is still **a work in progress**, as we are working on migrating the dependencies this repository uses from private scopes to public ones. Once completed, dependencies will be available to the community to build, develop, and contribute to this repository.

Your contribution makes Kong Manager a better one. We are open to issues and contributions.

Because Kong Manager operates the Admin API under the hood, it is recommended to start Kong Gateway locally. You may check out the [_Getting Started_](https://github.com/Kong/kong/blob/master/README.md#getting-started) and [_Contributing_](https://github.com/Kong/kong/blob/master/README.md#contributing) section in [Kong Gateway's README](https://github.com/Kong/kong/blob/master/README.md) for more information.

The development server will use the 8001 (Admin API) and 8002 (Admin GUI) ports on localhost by default. To verify if these two ports are available, please visit [http://localhost:8001/](http://localhost:8001/) and [http://localhost:8002/kconfig.js](http://localhost:8002/kconfig.js) in the browser. You should see the content showing in the browser.

Besides, the software listed below is required:

- Git
- Node (See [.nvmrc](.nvmrc) for recommended version)

Next, we will clone the repository and `cd` into the directory:

```shell
git clone https://github.com/Kong/kong-manager-oss.git
cd kong-manager-oss
```

Then, we will install the dependencies:

```shell
yarn
```

Finally, let's start the development server:

```shell
yarn serve
```

The development server will be now accessible from [http://localhost:8080/](http://localhost:8080/) by default.

## License

```
Copyright 2016-2023 Kong Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

See [LICENSE](LICENSE) for the full text
