# Development

> 🚧 This document is still a work in progress.

## Testing

### End-to-end testing

End-to-end testing, also called E2E testing, guarantees that applications perform as expected and maintain seamless data flow for diverse user tasks and processes. This testing strategy begins from the perspective of end users and replicates real-life scenarios.

Kong Manager uses Playwright to perform end-to-end tests. To install dependencies required for end-to-end testing, run the following command:

```shell
pnpm install:e2e
```

Afterward, run all the test cases using the following command:

```shell
pnpm test:e2e
```

You may find all the test cases for end-to-end testing under the `tests/playwright/specs` folder. Please feel free to make any necessary modifications and add new test cases as per your requirements. Happy testing!
