Using `node_sails>` as base directory.
No need to `npm init`. Sails does scaffolding for you.

```
> npm install sails -g  # installs globally
```

Create new project folder and files

```
> sails new activityOverlord --linker
```

Install sails-mysql
Installed again on server when deploying
Installing sails-mysql also installs sails and a few other dependencies.

```
> npm install sails-mysql
```

Need to add "user" table to production database.