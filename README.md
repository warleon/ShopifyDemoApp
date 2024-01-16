# English Version Report

## Design Decisions

### Stack

#### Programing Language: TypeScript

#### Execution Enviroment: Node.js v20.11.0 (Latest at the time)

#### Web Server: Next.js

I have chosen Next.js because it is the framework requested in the job posting.

#### Database: SQLite + Prisma ORM

For the database I decided to use Prisma as the ORM and SQLite as the backend database, just for simplicity

### API Design

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

#### Struggles

Since **This API** is meant to be used with a **private app** created in the
**Shopify Admin Configuration Panel**
I have encountered an "unsolvable problem" during the development.
that the neither **Shopify Admin API validation utility** nor a
**Custom made validation procedure** made following the documentation for Webhooks validation
are able verify the incoming message due to the inexisting **Client Secret**
available for a **public app** created in the **Shopify Partners Dashboard**

#### Solutions

For the first version of **This API** I, in an optimistic mindset,
left the incomming request pass even if the Hmac validation fails

**TODO make This API Oauth compatible**

## Testing

### Requirements

- Node.js v20.11.0
- ngrok v3.5.0
- VS Code + Thunder Client Extension (For endpoints testing)

the versions are not mandatory, it may run with previous ones

### To run

I will asume that you have:

- A **Shopify Development Store** alredy created.
- A **Shopify Private App** for that store already created with access to its **API Credentials** and the permision to **Read Customers** data
- Two different email accounts, with one beign a **Gmail Account** with **Two Factor Authentication**
- A **Gmail Application Specific Password** wich you can get from [here](https://security.google.com/settings/security/apppasswords)

Then:

1.  Clone this repository if reading this on Github, else skip this step
1.  Open the current directory (the one that contains this readme.md) on VSCode
1.  Create a `.env.local` file with the following enviroment variables:

    ```
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
    and paste it as the value of the `SHOPIFY_APP_URL` in the `.env.local` file
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

1.  Then you are ready to start playing with **This API** by sending some
    request, feel free to modify the default ones in the
    `thunder-collection_baltoTask.json`
1.  You can also play with **This API** in the **Shopify Admin Pannnel** by **modifying or creating some customers** in that case make sure to leave your email, so that you can test the send mail endpoint

# Version en Español del Informe
