# nest x amqp-connection-manager example

## Installation

```bash
$ npm install
```

## Running the app

> Before start app, we should setup a `rabbitmq` instance at local

```bash
$ docker-compose -f docker-compose.test.yml up -d
```

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
