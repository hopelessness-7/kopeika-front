#!/bin/sh
set -e
# Named volume `front_node_modules` outlives image rebuilds and can miss
# newly added deps (e.g. workbox-* for InjectManifest SW).
npm install --ignore-scripts
exec "$@"
