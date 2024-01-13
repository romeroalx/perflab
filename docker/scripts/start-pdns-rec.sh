#!/bin/bash

set -x

/opt/pdns-recursor/sbin/pdns_recursor --daemon=yes

echo "[DONE]" && exit 0
