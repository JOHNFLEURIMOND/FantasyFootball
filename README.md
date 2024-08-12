# :checkered_flag: Project Overview :checkered_flag::

## How It's Made :nut_and_bolt:🔨 :hammer::wrench::

This application is built with the following technologies:

- **Frontend:** React.js, Semantic UI, styled-components
- **Backend:** Express.js, Node.js
- **Build Tool:** Webpack

## Optimizations

This project is optimized for development and production. It features a modern JavaScript setup with Webpack for bundling and Babel for JavaScript compilation.

### Verify Node.js and npm Versions

To check your current Node.js and npm versions:

```bash
node -v && npm -v
# Example output:
# v20.16.0
# 10.8.1
```

### Install and Use the Correct Node.js Version

To install and use the correct Node.js version:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20
```

## My Awesome Project & Lessons Learned :mortar_board::

For more details on the project and the lessons learned, please refer to [My Portfolio](https://johnfleurimond.netlify.app).

## Getting Started :arrow_forward::

### Kill Node Processes

To stop any running Node.js processes:

```bash
pkill -f node
```

### Installation

1. **Clone the Repository:**

   ```bash
   git clone {{repository-url}}
   cd {{repository-directory}}
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

## Available Scripts

In the project directory, you can run:

### `npm run dev`

**Example Output:**

```
webpack-dev-server v5.0.4  ready in 107 ms

  ➜  Local:   http://localhost:5000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Runs the app in development mode. Open [http://localhost:5000](http://localhost:5000) to view it in your browser. The page will reload if you make edits, and lint errors will be displayed in the console.

### `npm run build`

Builds the app for production to the `build` folder. This bundles React in production mode and optimizes the build for the best performance. The build is minified, and the filenames include hashes. Your app is ready to be deployed.

### `npm run prettier`

Formats the code according to Prettier configuration.

### `npm run clean`

Cleans the npm cache and builds the project. Use this to ensure a fresh start for builds.

## :keyboard::computer_mouse::desktop_computer::computer:: GitHub :computer::desktop_computer::keyboard::

### :broom::soap: Clean Up Code Before Pushing :soap::broom:

Before pushing changes to the repository, clean up the code and update dependencies:

```bash
npm run prettier
rm -rf package-lock.json
rm -rf node_modules
git add .
git commit -m "Update README"
git push
```

or

```bash
npm run prettier && rm -rf package-lock.json && rm -rf node_modules && git add . && git commit -m "Update README" && git push
```

To update dependencies and handle known issues:

```bash
rm -rf package-lock.json
rm -rf node_modules
npm install -g npm-check-updates
ncu -u
npm install
npm ls ajv
npm install --save-dev ajv@^8
```

or

```bash
rm -rf package-lock.json && rm -rf node_modules && npm install -g npm-check-updates && ncu -u && npm install && npm ls ajv && npm install --save-dev ajv@^8
```

### :heavy_plus_sign::heavy_plus_sign: Merging Code :heavy_plus_sign::heavy_plus_sign:

1. **Check Your Current Branch:**
   List all branches and check your current branch:

   ```bash
   git branch -a
   ```

   If you need to create a new branch:

   ```bash
   git checkout -b {{name-of-your-branch}}
   ```

2. **Add and Commit Your Changes:**
   Add and commit your work:

   ```bash
   git add .
   git commit -m "{{explain your changes}}"
   git push
   ```

3. **Fetch and Pull Updates:**
   Fetch and pull all changes from remote branches:

   ```bash
   git fetch --all
   git pull --all
   ```

4. **Merge or Rebase:**
   Merge changes from the main branch to your branch:

   ```bash
   git merge main
   ```

   Alternatively, you can rebase:

   ```bash
   git rebase main
   ```

   **Important:** Resolve any conflicts that arise, accept the incoming changes as needed, and commit the resolved changes:

   ```bash
   git add .
   git commit -m "Merged main branch into current branch"
   git push
   ```

   or

   ```bash
   git add . && git commit -m "Merged main branch into current branch" && git push
   ```

## License

Fleurimond 2024

## Contributing

For details on how to contribute, please refer to [CONTRIBUTING.md](./CONTRIBUTING.md).

## How It Works:white_check_mark::

The application provides real-time fantasy football news and player projections, utilizing React for the frontend and Express for the backend. It interacts with the Sportsdata.io API to fetch data, which is then displayed through a user-friendly interface with Semantic UI and styled-components.

## Contact

.. For any questions or feedback, please reach out to [Fleur](https://johnfleurimond.netlify.app)..
