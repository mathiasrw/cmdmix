# CMDmix

_Execute a template CLI command with dynamic values_

CMDmix is a very thin layer that allows you to treat CLI commands as templates and provide input parameters before executing the final command. This enhances the capabilities of `package.json` scripts and other command-line tools like Yarn and npm.

## TL;DR

#### Install

```bash
bun add cmdmix --dev
yarn add cmdmix --dev
npm install cmdmix --dev
pnpm install cmdmix --dev
```

#### Smart to use because

CMDmix reduces the chance of errors by allowing you to simplify complex commands and make them easier to type out.

| 😒                                                      | 😎                            |
| ------------------------------------------------------- | ----------------------------- |
| `git add --all && git commit -m 'Will fix TEC-13'`      | `yarn commit Will fix TEC-13` |
| `git fetch && git checkout feature/develop && git pull` | `yarn goto develop`           |

CMDmix lets you control where input parameters are placed into your commands before executing them.

```sh
$ cmdmix 'echo %1 %2' a b
> a b

$ cmdmix 'echo %2 %1' a b
> b a
```

## Why

Let's say you often check out new feature branches in a git repo and you are tired of always writing `git fetch` before you do a `git checkout myBranch`. Yarn can help you out because you can have the first part as a script in `package.json`, and when you add the branch name to the Yarn command, it gets added. So in your `package.json`, you have `"goto": "git fetch && git checkout"`

Now, running:

    $ yarn goto myBranch

will execute:

    $ git fetch && git checkout myBranch

That is great, and Yarn can be used to automate many things. (A more relevant example has been included in the `package.json` of this repo, where `yarn format` will format the content of files and `yarn test-format` will verify if everything is formatted, having both commands rely on the same code for identifying what files to consider.)

However, if the branch has already been checked out, you will have to do a `git pull` to make sure you have the latest changes from the origin. So, we need a way to run something like:

    $ git fetch && git checkout X && git pull

by typing:

    $ yarn goto X

## What

Using CMDmix, you can place dynamic parameters into a command template before executing it.

Having the following in your `package.json`:

    "goto": "cmdmix 'git fetch && git checkout feature/%1 && git pull'"

will let `yarn goto something` execute as:

    $ git fetch && git checkout feature/something && git pull


_If you would like to support branch names that include spaces, please wrap the branch name parameter with quotes and escape them because of the JSON in `package.json`: \"%1\"._

### Keys

The keys `%1` to `%9` can be used in the command template to insert input parameters.

#### I need my `%2`

Ok—so for some reason, you need to write `%2` without it getting replaced. Please use `%%2` in your command to execute without `%2` being replaced.

#### Order of keys

The number of the key indicates the order of the keys—not the placement of the parameter. This means that we have the following apparently quirky but purposefully intended usage:

```sh
$ cmdmix 'echo %1 %2' a b
> a b

$ cmdmix 'echo %4 %8' a b
> a b

$ cmdmix 'echo %2 %1' a b
> b a
```

Reason: Imagine having a long command with many keys and then needing to remove one. Usually, you would need to rename all the following. With this setup, you can remove one key in the middle and just change how you use the command.

#### The highest key is greedy

If there are more parameters than keys to be replaced in the command, the highest key will treat the rest of the parameters as a single string of text.

```sh
$ cmdmix 'echo %2 %1' a b c d   # Highest placeholder is greedy
> b c d a
```

This enables the user to type long texts without thinking about quotes.

### In short

1. Placeholders are numbered `%1` to `%9`.
2. Numbers indicate replacement order, not parameter position. (So `'echo %1 %2' a b` gives the same result as `'echo %2 %1' a b`)
3. When there are more input parameters than placeholders, the last argument will contain all the rest of the parameters concatenated by space.
4. Use `%%n` to output a literal `%n` (where n is a number).

## Configuration

The following configuration makes it possible to change the behaviour of CMDmix. For historical reasons, the configuration is set via environment variables. They are provided before the command, can't have spaces next to the `=`, and you can use multiple by separating them with spaces.

### Print command before executing

Set `CMDMIX_PRINT_CMD` to 1 to print the fully constructed command before it runs—handy for debugging or transparency.

```bash
CMDMIX_PRINT_CMD=1 yarn goto develop
```

### Minimum number of input parameters

Normally, CMDmix will allow for any number of input parameters. If you would like it to error in case there are fewer input parameters than `X`, then set `CMDMIX_MIN_INPUT` to `X`.

```bash
CMDMIX_MIN_INPUT=1 yarn goto develop
```

### Strict

Normally, CMDmix will allow for any number of parameters. If you would like it to error in case there are not the exact same number of placeholders and parameters provided, then set `CMDMIX_STRICT` to 1.

```bash
CMDMIX_STRICT=1 yarn goto develop
```

### Exit code

Normally, CMDmix will exit using the exit code of the command executed. If you would like the exit code to indicate success even if the command did not run successfully, set `CMDMIX_IGNORE_ERROR` to 1.

```bash
CMDMIX_IGNORE_ERROR=1 yarn goto develop
```

This is useful for fault-tolerant scripts in CI/CD pipelines. Note that the exit code will always indicate an error if there is no command provided to run or if STRING or MIN are not adhered to.

### Custom Shell

Use `CMDMIX_SHELL` to set the path to execute via a specific shell:

```bash
CMDMIX_SHELL=/bin/zsh yarn goto my-feature
```

## Limitations

- Unexpected results may occur if parameters contain `%n` where `n` is smaller than or equal to the largest placeholder number.
- Maximum of 9 placeholders (`%1` to `%9`).

### Ideas

- `cat urls.txt | npx cmdmix "wget {{0}}"
