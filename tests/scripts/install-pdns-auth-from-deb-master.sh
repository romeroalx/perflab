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
echo "deb [signed-by=/etc/apt/keyrings/auth-${PDNS_VERSION}-pub.asc arch=amd64] http://repo.powerdns.com/debian bullseye-auth-${PDNS_VERSION} main" > /etc/apt/sources.list.d/pdns.list
echo "Package: pdns-*" > /etc/apt/preferences.d/auth-${PDNS_VERSION}
echo "Pin: origin repo.powerdns.com" >> /etc/apt/preferences.d/auth-${PDNS_VERSION}
echo "Pin-Priority: 600" >> /etc/apt/preferences.d/auth-${PDNS_VERSION}
install -d /etc/apt/keyrings
curl https://repo.powerdns.com/${PDNS_SIGNATURE}-pub.asc | tee /etc/apt/keyrings/auth-${PDNS_VERSION}-pub.asc
apt-get update

# Install software
apt-get install -y pdns-server pdns-backend-${PDNS_BACKEND}

# Link configuration
mkdir -p /var/run/pdns
ln -s /tmp/powerdns/* ${PDNS_CONFIG_DIR}

# Start PDNS
${PDNS_BIN_DIR}/pdns_server --config-name=${PDNS_BACKEND} ${ADDITIONAL_PARAMS_AUTH} --daemon

echo "[DONE]" && exit 0
