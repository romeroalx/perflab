#!/bin/bash

set -x

backend=${PDNS_BACKEND}
if [[ -z $backend ]]; then backend=lmdb; fi

zones_folder=${PDNS_ZONES_DIR}
if [[ -z $zones_folder ]]; then zones_folder=/etc/powerdns/zones; fi

tools_folder=${PDNS_TOOLS_DIR}
if [[ -z $tools_folder ]]; then tools_folder=/usr/local/bin; fi

pushd ${zones_folder}

for zf in `ls *.zone`; do
    zone_name=$(echo $zf | cut -d "." -f 1)
    if [[ "$zone_name" == "root" ]]; then zone_name="."; fi
    ${tools_folder}/pdnsutil --config-name=${backend} load-zone ${zone_name} ${zones_folder}/${zf}
done

${tools_folder}/pdnsutil --config-name=${backend} list-all-zones

popd

echo "[DONE]" && exit 0
