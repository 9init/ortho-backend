## Description

This project is the backend for an Ortho application. It acts as an API server, handling incoming requests and utilizing functionalities provided by Ortho AI APIs.

## Prerequisites

1. Install [Ortho AI](https://github.com/9init/ortho-ai-backend) and make sure the port is exposed.
2. NodeJS v18.17.0 at least.
3. Install [pnpm package manager](https://pnpm.io/installation).
4. [MySQL 8](https://dev.mysql.com/downloads/mysql/) at least.

## Installation

```bash
$ pnpm install
```

## Set Environment Variables

1. Locate the `ENVEXAMPLE` file within the repository and copy it as `.env`. This file will serve as the configuration file for your environment variables. Follow the steps below:
2. Open the .env file using a text editor of your choice. You'll find example environment variables provided in the ENVEXAMPLE file. Update these variables with the actual data specific to your project.
3. Create the database using the following command:
    ```bash
    mysql -u <MYSQL_DATABASE_USER> -p -e 'create database <MYSQL_DATABASE_NAME>;'
    ```
    - replace `<MYSQL_DATABASE_USER>` with your database username.
    - replace `<MYSQL_DATABASE_NAME>` with your database name. 
    - make sure both of them are same as in the `.env` file.

**Note**: `MODEL_HOST` represents the URL for the models API. You'll find instructions on setting up the models API server in the repository. Refer to the documentation or setup guide available in [Ortho AI](https://github.com/9init/ortho-ai-backend) Repository

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev
```
