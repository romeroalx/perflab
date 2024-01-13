#!/bin/bash

set -x

PDNS_VERSION=$1
PDNS_CONFIG_DIR=/etc/powerdns

if [[ "$PDNS_VERSION" == "master" ]]; then
    PDNS_SIGNATURE=CBC8B383
else
    PDNS_SIGNATURE=FD380FBB
fi

# Update apt references
apt-get update && apt-get -y dist-upgrade && apt-get clean
apt-get install -y curl gnupg

# Add PowerDNS repos
echo "deb [signed-by=/etc/apt/keyrings/rec-${PDNS_VERSION}-pub.asc arch=amd64] http://repo.powerdns.com/debian bullseye-rec-${PDNS_VERSION} main" > /etc/apt/sources.list.d/pdns.list
echo "Package: pdns-*" > /etc/apt/preferences.d/rec-${PDNS_VERSION}
echo "Pin: origin repo.powerdns.com" >> /etc/apt/preferences.d/rec-${PDNS_VERSION}
echo "Pin-Priority: 600" >> /etc/apt/preferences.d/rec-${PDNS_VERSION}
install -d /etc/apt/keyrings
curl https://repo.powerdns.com/${PDNS_SIGNATURE}-pub.asc | tee /etc/apt/keyrings/rec-${PDNS_VERSION}-pub.asc 
apt-get update

# Install software
apt-get install -y pdns-recursor

# Copy configuration
mv ${PDNS_CONFIG_DIR}/recursor.conf ${PDNS_CONFIG_DIR}/recursor.conf.old
mkdir -p /var/run/pdns-recursor
ln -s /tmp/powerdns/* ${PDNS_CONFIG_DIR}

# Start Recursor
${PDNS_BIN_DIR}/pdns_recursor ${ADDITIONAL_PARAMS_REC} --config-dir=${PDNS_CONFIG_DIR} --daemon

echo "[DONE]" && exit 0
