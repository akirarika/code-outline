# Code Outline

Helps you display an outline for your lengthy schema.prisma or vue files and sets up nodes in your code using comments!

I often find myself in situations where I need to write a lot of logic in a single file, which typically consists of hundreds or thousands of lines of code. Yes, I'm talking about you, [Vue](https://vuejs.org/) and [Prisma](https://www.prisma.io/)!

Long code forces me to constantly switch between files. To alleviate this problem, I developed this [VSCode extension](https://marketplace.visualstudio.com/items?itemName=akirarika.prisma-outline). You can use comments to create a "node" in your code, and then easily navigate to your comments using the sidebar in VSCode. In addition to defining nodes in the outline using comments, I also attempt to summarize your code. Some key points in the code will automatically be summarized as child nodes of the outline. It was originally designed for Prisma, but now supports Vue as well.

## Prisma

> Note: If you want a way to split your `schema.prisma` file, you can try using [prisma-import](https://github.com/ajmnz/prisma-import). I highly recommend it.

You can add outline nodes by adding comments that start with an asterisk (\*). You must have at least one outline node for me to work, like this:

```ts
// * Your outline node
```

While that is enough, it might look nicer to write it like this:

```ts
// -----------------
// * Your outline node
// -----------------
```

All models will be automatically marked and included as subsets of the outline nodes. If the line before a model is a comment in the form of `///`, the name of the model will include the content of that comment.

Try pasting the following code into your `schema.prisma` file and see the effect, are you ready?

```ts
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider     = "mysql"
  relationMode = "prisma"
  url          = env("DATABASE_URL")
}

// -----------------
// * Users and Permissions
// -----------------

/// User table
model user {
  id             Int           @id
  name           String?
  email          String?
  updatedAt      DateTime         @updatedAt
  createdAt      DateTime         @default(now())
  UserPermission userPermission[]
}

/// User Permission table
model userPermission {
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

/// Article table
model article {
  id        Int   @id
  title     String
  content   String
  userId    Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

/// Comment table
model comment {
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

## Vue

For `.vue` documents, the following comments will be treated as outline nodes. You can use outline nodes to quickly navigate through the document.

```ts
// * Your outline
```

```ts
/**
 * -- Your outline
 */
```

```html
<!-- Your outline -->
```

These will be automatically commented and treated as subsets of the outline.

- `defineProps`, `defineEmits`, `ref`, `reactive`, `const`, `function`

## More

The extension will always show the outline nodes in your `/prisma/schema.prisma` file unless you have opened a `.vue` file.

If the extension is not displaying your prisma outline nodes, make sure that there is a `/prisma/schema.prisma` file in the directory of the editor you currently have open. Often, this is because you have opened the parent directory of your project.
