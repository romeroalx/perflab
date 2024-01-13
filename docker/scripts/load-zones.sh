#!/bin/bash

set -x

backend=${PDNS_BACKEND}
if [[ -z $backend ]]; then backend=lmdb; fi

zones_folder=${PDNS_ZONES_DIR}
if [[ -z $zones_folder ]]; then zones_folder=/etc/powerdns/zones; fi

bin_folder=${PDNS_BIN_DIR}
if [[ -z $bin_folder ]]; then bin_folder=/usr/local/bin; fi

pushd ${zones_folder}

for zf in `ls *.zone`; do
    zone_name=$(echo $zf | cut -d "." -f 1)
    if [[ "$zone_name" == "root" ]]; then zone_name="."; fi
    ${bin_folder}/pdnsutil --config-name=${backend} load-zone ${zone_name} ${zones_folder}/${zf}
done

${bin_folder}/pdnsutil --config-name=${backend} list-all-zones

popd

echo "[DONE]" && exit 0
