## API Install

This script is designed to setup the user collection, slugify and publish-user authentication hook.

There is an initial check for the collection which makes sure of it's existance, as well as checking appropriate fields are present.

### Running the script

The script requires a config containing details for the API(s) that are to be updated.

#### When running as a standalone app (usually development)

```shell
npm run api-install
```

#### When running via npm

Running with `npm expore` doesn't tell the script where it's being called from so we must specify a config directory folder.

```shell
 NODE_ENV=development npm explore publish -- npm run api-install --configDir=/path/to/config/directory

```
