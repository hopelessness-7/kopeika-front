#!/bin/sh
set -e
# Named volume `front_node_modules` outlives image rebuilds and can be
# stale/corrupt after dependency bumps (workbox for InjectManifest SW).
# `npm ci` wipes node_modules and installs exactly from the lockfile.
npm ci --ignore-scripts
exec "$@"
