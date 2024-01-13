#!/bin/bash

echo "Hi there!"

sshqa='ssh -o StrictHostKeyChecking=no -i /Users/alexis/Projects/performance/openstack-isc-lab/ssh/testing-qa.pem'

hosts="perflab-server-vm perflab-http-vm"

for host in $hosts; do
    $sshqa root@$host "systemctl stop firewalld; systemctl disable firewalld; sleep 1; systemctl status firewalld"
done

echo "[DONE]" && exit 0
