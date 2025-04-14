[![Build](https://github.com/Ao-Collaboration/peeps-v2/actions/workflows/build.yml/badge.svg)](https://github.com/Ao-Collaboration/peeps-v2/actions/workflows/build.yml)
[![Deploy Website](https://github.com/Ao-Collaboration/peeps-v2/actions/workflows/deploy-website.yml/badge.svg)](https://github.com/Ao-Collaboration/peeps-v2/actions/workflows/deploy-website.yml)
[![Deploy Webhooks](https://github.com/Ao-Collaboration/peeps-v2/actions/workflows/deploy-webhooks.yml/badge.svg)](https://github.com/Ao-Collaboration/peeps-v2/actions/workflows/deploy-webhooks.yml)

# Peeps Builder!

This is the repository for the Peeps builder website!

## Usage

### Run

Run the application:

```sh
yarn start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

### Update

Click the button below to run the Notion content update script.

[![Update Content](https://github.com/Ao-Collaboration/peeps-v2/actions/workflows/update-content.yml/badge.svg)](https://github.com/Ao-Collaboration/peeps-v2/actions/workflows/update-content.yml)

### Build

```sh
yarn build
```

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

### Scripts

There are a number of scripts for updating the data from Notion.

To download and process the traits from the Peeps Notion database:

```sh
yarn script:notion
```

To update the images:

```sh
yarn script:images
```

Be sure to run the image update script after the notion script.

### Webhooks

See the [webhooks folder](./webhooks) for more information.

## License

The code in this repository is licensed to [Ao Collaboration Ltd](https://aocollab.tech) under the Apache 2.0 license.

Peeps created by this website are not covered under this license. Peeps imagery remain the property of Ao Collaboration Ltd.
