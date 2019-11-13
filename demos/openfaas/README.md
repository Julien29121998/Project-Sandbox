# Genesys Royale

## Prerequisites

* Docker >= 17.06

## Installation

* First get `faas-cli` from the releases [here](https://github.com/openfaas/faas-cli/releases).

* Add the cli to `PATH`.

### Fast

Start swarm with `npm run start`.

Build and test with `npm run build`.

Stop swarm with `npm run stop`.

### Manual

* Initialize a `swarm` with command `docker swarm init`.

* Deploy stack with command `git clone https://github.com/openfaas/faas && cd faas && ./deploy_stack.sh`

* Login with `faas-cli` with command `$ faas-cli login --username=USERNAME --password=PASSWORD`

* Go to: `http://localhost:8080` and log in with your credentials.

## Usage

### csharp

* Build command: `faas-cli build -f ./functions/csharp/helloworld/helloworld.yml`

* Deploy command: `faas-cli deploy -f ./functions/csharp/helloworld/helloworld.yml`

* Delete command: `faas-cli rm -f ./functions/csharp/helloworld/helloworld.yml`

* Test: `http://localhost:8080/function/csharphelloworld`

### node

* Build command: `faas-cli build -f ./functions/node/helloworld/helloworld.yml`

* Deploy command: `faas-cli deploy -f ./functions/node/helloworld/helloworld.yml`

* Delete command: `faas-cli rm -f ./functions/node/helloworld/helloworld.yml`

* Test: `http://localhost:8080/function/nodehelloworld`

## Reset

* Run command: `docker service ls --filter="label=function" -q | xargs docker service rm`

* Run command: `docker stack rm func && docker secret rm basic-auth-user && docker secret rm basic-auth-password`

* Run command: `docker swarm leave --force`
