# cmdmix
_Butt in that value to your line of commands_

A very thin layer letting your place dynamic values into a (yarn) command from parameters. Useful to omit how yarn only appends to the end of the command.

## TL;DR

#### Install

    yarn add cmdmix --dev


#### Smart to use because

Make a trivial sequence of commands easy to type out. 

Examples:

- 😎 `yarn commit Will fix #13` 
- 😒 `git add --all && git commit -m 'Will fix #13'`
- 😎 `yarn goto something` 
- 😒 `git fetch && git checkout feature/something && git pull`


    
    
    
## Why

Let's say you often check out new feature branches in a git repo and you are tired of always writing `git fetch` before you do a `git checkout myBranch`. Yarn can help you out because you can have the first part as a script in package.json and when you add the branch name to the yarn command it gets added. So in your package.json you have `"goto": "git fetch && git checkout"`

now running 

    $ yarn goto myBranch
    
will execute 

    $ git fetch && git checkout myBranch

That is great, and yarn can be used to automate many things. (A more relevant example has been included in the package.json of this repo where `yarn format` will format the content of files and `yarn test-format` will verify if everything is formatted having both commands rely on the same code for identifying what files to consider.)  

  However, if the branch has already been checked out, you will have to do a `git pull` to make sure you have the last changes from the origin. So we need a way to run something like

    $ git fetch && git checkout X && git pull
    
by typing 

	$ yarn goto X
    
    
    
## What

Using cmdmix you can place dynamic parameters where you want into a command. Having the following in your package.json 

    "goto": "cmdmix 'git fetch && git checkout feature/%1 && git pull'"

will let `yarn goto something` execute as 

    $ git fetch && git checkout feature/something && git pull
    
(if you like feature branch names inlcuding spaces please wrap the branch name prameter with `\"...\"`)


    

### Keys

The keys `%1` to `%9` can be used to point to a parameter. 


#### Order of keys

The number of the key indicates the order of the keys - not the placement of the parameter. This means that we have the following apparently quirky but purposefully intended usage:

```
$ cmdmix 'echo %1 %2' a b
> a b

$ cmdmix 'echo %3 %7' a b
> a b

$ cmdmix 'echo %9 %4' a b
> b a

```

Reason: Imagine having a long command with many keys and then you need to remove one. Usually you would need to rename all the following. With this setup you can remove one key in the middle and just change how you use the command. 


#### The last key

If there are more parameters then keys to be replaced in the command, the last key will treat the rest of the parameters as a single string of text. 

```
$ cmdmix 'echo %1' a b
> a b

$ cmdmix 'echo %2' a b
> a b

$ cmdmix 'echo %9 %4' a b c
> b c a

```

This way we can type freely without thinking about `'...'` or `"..."`. 

**Example:** Having 

    "commit": "cmdmix 'git add --all && git commit -m \"%1\"'"
    
will let you type 

    yarn commit This is my best feature ever...
    
instead of wasting your time writing

    git add --all && git commit -m 'This is my best feature ever...'

#### I need my `%2`

Ok - so for some reason you rneed to write `%2` without it getting replaced. Plesae use `%%2` in your command to execute as `%2` without it being replaced. 

## Keep an eye on things

You can have the final command printed before it gets executed by setting the `PRINT_CMD` enviroment boolean flag (1 or 0). This is usefull to create transparency and when debugging. 

    PRINT_CMD=1 cmdmix 'deno run -A ./%1.run.ts'
    
    
## Limitations

Please note that the current implementation will give unexpected results if the parameters provided contains `%n` where n i a positive integer smaller or equal to the larget key number. 
