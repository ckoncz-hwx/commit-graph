# Git commit dependency analysis

! WORK IN PROGRESS

Given a set of commits to cherry pick from a branch, find out the commits that modified the affected files before and need to be cherry-picked in order to guarantee succesful transfer of the desired commits.

The set of primary commits is collected by checking the commit mesages for Apache tickets.

## Usage:
 - `npm install`
 - `node index.js` will generate `commit-graph.json`. The git working dir, branch and Apache tickets to search are hardcoded in `index.js`.
 - `npm run server` will launch an HTTP server that displays the graph.