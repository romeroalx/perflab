#!/bin/bash

echo "Hi there!"

export OS_CLOUD=ox-cloud2

host="perf-traffic-gen"
mgmt_network=oxp_qa_mgmt-network

mgmg_port_id=$(openstack port list --server $host --network $mgmt_network -f yaml | yq '.[0].ID');

if [[ "$mgmg_port_id" != "null" ]]; then
    openstack port set --disable-port-security $mgmg_port_id
    openstack port show $mgmg_port_id
else
    echo "[ERROR]. Port not found" && exit 1
fi

echo "[DONE]" && exit 0
