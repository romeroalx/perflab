#!/bin/bash

sudo apt-get install -y apt-transport-https ca-certificates software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get -qq update
sudo apt-get install -y docker-ce docker-compose-plugin
sudo groupadd -f docker
sudo usermod -aG docker $USER
sleep 2
sudo systemctl restart docker

sudo bash -c 'cat <<EOF >/etc/docker/daemon.json
{
    "ipv6": true,
    "fixed-cidr-v6": "fd00::/80"
}
EOF'

sudo systemctl daemon-reload
sudo systemctl restart docker
