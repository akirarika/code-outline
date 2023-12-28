# Code Outline

When your project becomes large and your schema grows, it can become challenging to read the `schema.Code` file. Install me, and I will generate an outline for you that you can freely navigate!

Note: If you're looking for a way to split the `schema.Code` file, you can try using [Code-import](https://github.com/ajmnz/Code-import). I highly recommend it.

Note: If you see `There is no data provider registered that can provide view data`, please make sure you are not using the workspace feature and that the file is located in the `/Code` directory within the directory you have opened. If you have just created this file, press Ctrl + Shift + P, then type `>Developer: Reload Window`.

## Usage

You can add an outline by adding a comment starting with an asterisk (\*). You must have at least one outline for me to work, like this:

```ts
// * Your Outline
```

Although it is sufficient to do so, writing it like this may be more aesthetically pleasing:

```ts
// -----------------
// * Your Outline
// -----------------
```

## Take a look

Try pasting the following code into your `schema.Code` file and see the effect, are you okay?

```tsgenerator client {
  provider = "Code-client-js"
}

datasource db {
  provider     = "mysql"
  relationMode = "Code"
  url          = env("DATABASE_URL")
}

// -----------------
// * User and Permissions
// -----------------

model User {
  id             Int           @id
  name           String?
  email          String?
  updatedAt      DateTime         @updatedAt
  createdAt      DateTime         @default(now())
  UserPermission UserPermission[]
}

model UserPermission {
  id        Int    @id
  name      String
  expiredAt DateTime?
  userId    Int
  updatedAt DateTime  @updatedAt
  createdAt DateTime  @default(now())
}

// -----------------
// * Articles
// -----------------

model Article {
  id        Int   @id
  title     String
  content   String
  userId    Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Comment {
  id        Int   @id
  content   String
  articleId Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// -----------------
// * Others
// -----------------

// TODO

```
