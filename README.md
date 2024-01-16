# English Version Report

## Design Decisions

### Stack

#### Programing Language: TypeScript

#### Execution Enviroment: NodeJs v20.11.0 (Latest at the time)

#### Web Server: NextJs

I have chosen NextJs because it is the framework requested in the job posting.

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

## Execution

# Version en Español del Informe
