#!/bin/bash

set -x

backend=${PDNS_BACKEND}

if [[ -z $backend ]]; then backend=lmdb; fi

/opt/pdns-auth/sbin/pdns_server --daemon=yes --config-name=${backend}

echo "[DONE]" && exit 0
