#!/bin/bash
rm -Rf build
# url.parse() deprecation of a dependency of vite / react-router
export NODE_OPTIONS=--disable-warning=DEP0169
if [ -n "$NVM_DIR" ] && [ -f "$NVM_DIR/nvm.sh" ] && [ -f .nvmrc ]; then
  source $NVM_DIR/nvm.sh
  nvm use
fi
yarn install --frozen-lockfile || exit 1
# locally prettier rewrites the files; CI (CI=true) only checks, so unformatted code that was committed fails there
if [ -n "$CI" ]; then
  yarn lint && yarn prettier || exit 1
else
  yarn prettier-fix && yarn lint || exit 1
fi

# The SPA index.html is rendered through a short-lived local preview server. A request to it occasionally
# times out, which a second attempt does not suffer from.
for attempt in 1 2 3; do
  # the SPA index.html is written by the prerender, a build without it deploys an empty site
  yarn build && [ -f build/client/index.html ] && exit 0
  echo "yarn build failed or build/client/index.html is missing (attempt $attempt of 3)"
  rm -Rf build
done
exit 1
