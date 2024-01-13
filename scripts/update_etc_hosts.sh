#!/bin/bash

echo "Hi there!"

export OS_CLOUD=ox-cloud2

hosts="perflab-server-vm perflab-http-vm"
mgmt_network=oxp_qa_mgmt-network
destination_file=/etc/hosts

if [[ "$(id -u -n)" != "root" ]]; then
    echo "Please execute with sudo";
    exit 1;
fi

for host in $hosts; do
    mgmg_port_id=$(openstack port list --server $host --network $mgmt_network -f yaml | yq '.[0].ID');

    if [[ "$mgmg_port_id" != "null" ]]; then
        ip_address=$(openstack floating ip list --port $mgmg_port_id -f yaml | yq '.[0].["Floating IP Address"]');
        if grep -Fq "$host" $destination_file; then
            sed -i '' '/'$host'/s/.*/'$ip_address' '$host'/' $destination_file
        else
            echo "$ip_address $host" >> $destination_file
        fi
    fi
done

cat $destination_file

echo "[DONE]" && exit 0
