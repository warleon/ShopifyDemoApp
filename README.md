# Table of Content

<!-- TOC start (generated with https://github.com/derlin/bitdowntoc) -->

- [Task](#task)
- [Design Decisions](#design-decisions)
  - [Stack](#stack)
    - [Programing Language: TypeScript](#programing-language-typescript)
    - [Execution Enviroment: Node.js v20.11.0 (Latest at the time)](#execution-enviroment-nodejs-v20110-latest-at-the-time)
    - [Web Server: Next.js](#web-server-nextjs)
    - [Database: SQLite + Prisma ORM](#database-sqlite--prisma-orm)
  - [API Design](#api-design)
- [Testing](#testing)
  - [Requirements](#requirements)
  - [To run](#to-run)
  - [Expected Behavior](#expected-behavior)
  - [Interesting Files](#interesting-files)
- [Struggles](#struggles)
  - [Solutions](#solutions)
- [Learning experience](#learning-experience)

<!-- TOC end -->

# Task

Create a **Server Only Custom Shopify App** that:

- [x] Has an endpoint for social media updates
- [x] Has an endpoint for sending emails
- [x] Registers a Webhook for the Customers/Update topic
- [x] Merges the information received from the webhooks and social media updates

# Design Decisions

## Stack

### Programing Language: TypeScript

### Execution Enviroment: Node.js v20.11.0 (Latest at the time)

### Web Server: Next.js

I have chosen Next.js because it is the framework requested in the job posting.

### Database: SQLite + Prisma ORM

For the database I decided to use Prisma as the ORM and SQLite as the backend database, just for simplicity

## API Design

For the API I have exposed just three http endpoints, wich are:

- **POST /api/webhook/update_customer**

  > To receive the incoming notifications from **Shopify**

- **POST /api/post/update_customer**

  > To receive the incoming notifications from social media
  > (custom test cases)

- **GET /api/get/send_mail**
  > To send the mail to the
  > **top ten most liked clients** and
  > **top ten most followed clients**
  > (only one email is sent per client if the sets share elements)

On start up the server will query shopify for all of the shop customers so that customers created before deployment are taken into consideration for the email sending

The **Customer's Marketing option**: "Customer agreed to receive marketing emails"
is ignored by **This Demo** just to make testing less cumbersome

# Testing

## Requirements

- Node.js v20.11.0
- Ngrok v3.5.0
- VS Code + Thunder Client Extension (For endpoints testing)

the versions are not mandatory, it may run with previous ones

## To run

I will asume that you have:

- A **Shopify Development Store** alredy created.
- A **Shopify Private App** for that store already created with access to its **API Credentials** and the permision to **Read Customers** data
- Two different email accounts, with one beign a **Gmail Account** with **Two Factor Authentication**
- A **Gmail Application Specific Password** wich you can get from [here](https://security.google.com/settings/security/apppasswords)
- An **Ngrok account** already **created** and **set up**, if not **Ngrok** will guide you through that proccess when executing its command

Then:

1.  Clone this repository if reading this on Github, else you already have the repo in your machine
1.  Open the current directory (the one that contains this readme.md) on VSCode
1.  Create a `.env` file with the following enviroment variables:

    ```
    DATABASE_URL="file:./dev.db"

    SHOPIFY_STORE=
    SHOPIFY_STORE_URL=${SHOPIFY_STORE}.myshopify.com

    SHOPIFY_API_KEY=
    SHOPIFY_API_SECRET=
    SHOPIFY_ACCESS_TOKEN=
    SHOPIFY_CLIENT_SECRET=${SHOPIFY_API_SECRET}
    SHOPIFY_APP_URL=

    EMAIL_ACCOUNT=
    EMAIL_PASSWORD=
    ```

    And populate `SHOPIFY_STORE`, `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`and `SHOPIFY_ACCESS_TOKEN` with its corresponding values from **Shopify**, and the `EMAIL_ACCOUNT` and `EMAIL_PASSWORD` fields with its corresponding values from your **Gmail Account**

1.  Open 3 terminals, one for **ngrok**, other for **Prisma Studio**, and other for **Next.js**

1.  On one terminal execute ngrok to create a test tunnel
    ```
    ngrok http 3000
    ```
1.  Copy the link of the **Forwarding** attribute shown in the **Ngrok terminal**
    and paste it as the value of the `SHOPIFY_APP_URL` in the `.env` file
1.  Install the project dependencies (npm in my case, you may use another package manager)
    ```
    npm install
    ```
1.  Initialize the database
    ```
    npx prisma migrate dev
    ```
1.  Open **Prisma Studio** to visualize database changes
    ```
    npx prisma studio
    ```
1.  In the last terminal execute the Next.js server
    ```
    npm run dev
    ```
    You can also run it on Production mode with
    ```
    npm run build
    npm run start
    ```
1.  Go to the **Thunder Client** VSCode extension and import the `thunder-collection_baltoTask.json` file that is at the root of **this directory**

If every step is correct, now:

> You are ready to start playing with **This API** by sending some
> request with **Thunder Client**, feel free to modify the default ones loaded from the
> `thunder-collection_baltoTask.json` file

> You can also play with **This API** in the **Shopify Admin Pannnel**
> by **modifying or creating some customers**
> in that case make sure to leave your email,
> so that you can test the send mail endpoint

Else:

> the program might fail in execution at some point, as it should

## Expected Behavior

When executing the requests loaded to **Thunder Client**

- Webhook
  - webhook get
    > 405 method not allowed, set response header allow:POST
  - webhook missing header
    > 400 bad reques, in debug mode shopify prints the headers needed
  - webhook invalid 200 but fail 0
    > 200 ok, no changes to the database done, it is 200 because of the ignored Hmac validation (same reason from now on)
  - webhook invalid 200 but success 0
    > 200 ok, creates a Customer record on the database with the given fields
  - webhook invalid 200 but success 1
    > 200 ok, if called after the previous resquest and left with the same email nothing should happen, because of the unique constraint applied to the email field
- update_custome
  - social_media get
    > 405 method not allowed, set response header allow:POST
  - social_media empty 0
    > 400 bad request, no side effects in the database
  - social_media empty 1
    > 400 bad request, no side effects in the database
  - social_media empty 2
    > 400 bad request, no side effects in the database
  - social_media empty 3
    > 400 bad request, no side effects in the database
  - social_media valid 0
    > 200 ok, record with the given id is updated in the database
  - social_media valid 1
    > 200 ok, record with the given id is updated in the database
  - social_media invalid 0
    > 400 invalid json, no side effects in the database
  - social_media invalid 1
    > 400 bad request, do side effects in the database
  - social_media invalid 2
    > 400 bad request, do side effects in the database
  - social_media invalid 3
    > 400 bad request, do side effects in the database
- send_mail
  - send_mail
    > 200 Ok, email is send from the gmail account specified in the enviroment variables to the corresponding emails accounts in the top ten most liked customers and top ten most followed customers (only once per account if sets are overlapping)
  - send_mail post
    > 405 method not allowed, set response header allow:GET

## Interesting Files

Just for **Code Review** simplification theese are the code files written by me:

- prisma/
  - **schema.prisma**
- src/
  - **instrumentation.ts**
  - **global.ts**
  - pages/api/
    - get/**send_mail.ts**
    - post/**customer_update.ts**
    - webhook/**customer_update.ts**

the other ones have been generated by **Next.js**

# Struggles

Since **This API** is meant to be used with a **private app** created in the
**Shopify Admin Configuration Panel**
I have encountered an "unsolvable problem" during the development.
that the neither **Shopify Admin API validation utility** nor a
**Custom made validation procedure** made following the documentation for Webhooks validation
are able verify the incoming message due to the inexisting **Client Secret**
available for a **public app** created in the **Shopify Partners Dashboard**

## Solutions

- For the first version of **This API** I, in an optimistic mindset,
  left the incomming request pass even if the Hmac validation fails

- **TODO make This API Oauth compatible**
- As an external solution, the firewall can be configured such that only allows incoming traffic from specific domains, such like **shopify.com**, this solution is inspired by [**This Stack Exchange Question**](https://unix.stackexchange.com/questions/91701/ufw-allow-traffic-only-from-a-domain-with-dynamic-ip-address)

# Learning experience

During the development of this task I have learned:

- Next.js features like the `instrumentation.ts` file
- Node.js tricks to set global constants/variables, see `global.ts`
- To use the **Shopify Admin API**
- How to include webhook or request validation when designing APIs
