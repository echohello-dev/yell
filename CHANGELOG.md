# Changelog

## 1.0.0 (2025-12-29)


### Features

* add release-please workflow ([#3](https://github.com/echohello-dev/yell/issues/3)) ([314c97d](https://github.com/echohello-dev/yell/commit/314c97d2d413ffda50322de49d2ba7dffece395f))
* **api:** implement wide event logging and error handling for requests ([ae20bc0](https://github.com/echohello-dev/yell/commit/ae20bc0b1447be9b67145f518019213dc66e974d))
* **config:** enhance Next.js configuration with security headers and redirects ([ae20bc0](https://github.com/echohello-dev/yell/commit/ae20bc0b1447be9b67145f518019213dc66e974d))
* **docker:** add Docker Compose configuration and local development setup ([cbb05f3](https://github.com/echohello-dev/yell/commit/cbb05f3ae404992ee74a123b5f2baa5f7f7fb096))
* enhance UI with new BrandMark component and update styles for consistency ([a177d03](https://github.com/echohello-dev/yell/commit/a177d030e6844f4825f6baf35e4f8a02e262f2bb))
* **home:** add demo link to navigation ([2b531cc](https://github.com/echohello-dev/yell/commit/2b531cc8faadaf2cf1994b1397d0ced0ff2ce30b))
* implement JoinClient component for game joining functionality and update JoinPage to use it ([84c4525](https://github.com/echohello-dev/yell/commit/84c4525e4270eab91f25162e08ce275579c3cb21))
* integrate BrandMark component and enhance HostPage layout and styles ([a74343c](https://github.com/echohello-dev/yell/commit/a74343c3cdc2125f4d12acd83fb22b2222871fd3))
* **join:** initialize join code from search params and remove unnecessary effect ([2b531cc](https://github.com/echohello-dev/yell/commit/2b531cc8faadaf2cf1994b1397d0ced0ff2ce30b))
* **middleware:** enforce security headers and policies for the application ([ae20bc0](https://github.com/echohello-dev/yell/commit/ae20bc0b1447be9b67145f518019213dc66e974d))
* **rateLimit:** add rate limiting for API and socket connections ([ae20bc0](https://github.com/echohello-dev/yell/commit/ae20bc0b1447be9b67145f518019213dc66e974d))
* **schemas:** define Zod schemas for questions, quizzes, sessions, and answers ([ae20bc0](https://github.com/echohello-dev/yell/commit/ae20bc0b1447be9b67145f518019213dc66e974d))
* **session:** integrate theme toggle and enhance session page layout ([8041487](https://github.com/echohello-dev/yell/commit/80414871b134bad316b49e8b53e7454b7a7f2235))
* **session:** update session management and enhance UI for better user experience ([2b531cc](https://github.com/echohello-dev/yell/commit/2b531cc8faadaf2cf1994b1397d0ced0ff2ce30b))
* **shared:** add vitest for testing and implement tests for leaderboard and winner selection ([729ede5](https://github.com/echohello-dev/yell/commit/729ede5b5717b74e81c852e6b2d4bdf14942a2c5))
* **tests:** add comprehensive validation tests for schemas and security ([ae20bc0](https://github.com/echohello-dev/yell/commit/ae20bc0b1447be9b67145f518019213dc66e974d))
* **tests:** add Playwright E2E testing setup and initial test cases ([9a0f8cc](https://github.com/echohello-dev/yell/commit/9a0f8cccb4870fda2496e467c170d023a03886d0))
* update JoinPage with GamePinForm component and enhance UI styles ([5760708](https://github.com/echohello-dev/yell/commit/576070828838f7c0ff53e7a2e37389348839989a))
* **vscode:** add commit message generation instructions for Copilot ([cf37701](https://github.com/echohello-dev/yell/commit/cf3770145fb049999dc704a0404a4b5ea33d272d))


### Bug Fixes

* **server:** improve session management and player validation in socket events ([ae20bc0](https://github.com/echohello-dev/yell/commit/ae20bc0b1447be9b67145f518019213dc66e974d))
* **sessions:** set default prize mode to 'top_score' in session creation ([89caf71](https://github.com/echohello-dev/yell/commit/89caf71a08f64eaf3519450986825055fc7e0681))
* simplify hostname assignment by removing redundant environment variable ([5c5cb9e](https://github.com/echohello-dev/yell/commit/5c5cb9ea027342ae1fd72958afebfe2b633333ba))
* update release workflow name and token usage in documentation ([334578e](https://github.com/echohello-dev/yell/commit/334578e7930c3e598c3c79b08f33fa24b98270d4))
* **vitest:** add missing watch option and shared alias in configuration ([e51edc6](https://github.com/echohello-dev/yell/commit/e51edc6955ae2e49650b9d691bd7e52e6b9b8e51))
