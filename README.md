<p align="center"><h1 align="center">Creaflix</h1>
<p>Creaflix is an API for an online movie watching platform submitted as a case study for Crea.</p>
<p align="center">
</p>

## Prerequisites

Ensure you have the following installed on your machine:

- **Node.js**: v20.13.1
- **Yarn**: v1.22.22

## Installation

```bash
$ yarn install
```

## Running the app

Before running the app locally, make sure you have a .env file in the root of the project.
You can refer to .env.example for the example format.

You should also have a PostgreSQL server running and available to be connected with
provided credentials in the environment.

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev
```

## Unit Tests

```bash
$ yarn run test
```

## E2E Tests

E2E tests require a PostgreSQL instance up and running. You can use following
command to start one (requires Docker):

```bash
$ docker-compose up -d
```

Then you can run e2e tests with following command

```bash
$ yarn run test:e2e
```

After running the tests, you can stop the DB container with following command:

```bash
$ docker-compose down
```

I'm sure there's a better way of doing this but due to time constraints,
this is the best I could do :) Currently, only user module is e2e tested.

## Modules

- **User Module**: For login and registration.
- **Movie Module**: For CRUD operations on movies.
- **Ticket Module**: For booking tickets.
- **Watch Module**: For watching movies and viewing watch history.

## License

This project is [MIT licensed](LICENSE).

## Developer Notes

Currently, MANAGER role is implemented as a superset of CUSTOMER role so
managers are able to book tickets, watch movies etc. This could be refactored
to only let customers perform these operations.

Time slots are hardcoded to take values between 0 and 6. 0 stands for 10.00-12.00, 1 stands for 12.00-14.00 and so on.
