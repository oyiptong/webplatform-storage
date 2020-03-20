# Webplatform Storage Demos

This repo contains the demos for a select number of storage-related web platform
demos.

## Requirements

The project could run with older versions, of the following, but it hasn't been
tested.

* node 12.20 and up
* npm 6.14.3 and up

## Project Set Up

To set up the projects, packages have to be installed. From the repo root, run
`setup.sh`.

This should  install all dependencies.

## Running Locally

To run locally, run the following:

```sh
cd static
npm run dev
```

This will run a local server and has hot-reload enabled.

## Deploying

The repo contains scripts to deploy on the Go 1.12 App Engine Runtime. As such
it requires the `gcloud` command-line SDK.

The following instructions are for deploying the app as configured in `app.yaml`
and `prod.yaml`. Modify those configuration files if you plan on using
App Engine or if want to use a different service name.

Handy (app.yaml instructions for the go runtime)[https://cloud.google.com/appengine/docs/standard/go/config/appref].

To deploy, ensure you have your App Engine project set up.

To deploy to the development environment, just type:

```sh
./deploy.sh
```

To deploy to the production environment, type:

```sh
./deploy.sh prod.yaml
```
