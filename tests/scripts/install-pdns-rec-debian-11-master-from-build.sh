#!/bin/bash

set -x

PDNS_VERSION=$1
PDNS_SW_DIR=/opt/pdns-recursor
PDNS_CONFIG_DIR=/etc/powerdns

apt-get update && apt-get -y dist-upgrade && apt-get clean

apt-get -y install \
    git curl gnupg software-properties-common wget libtool \
    ca-certificates apt-utils build-essential cmake acl \
    npm time mariadb-client postgresql-client jq python python3-venv

git clone https://github.com/PowerDNS/pdns.git ${PDNS_SW_DIR}

apt-get -qq -y --no-install-recommends --allow-downgrades install \
        bison \
        default-libmysqlclient-dev \
        flex \
        libboost-all-dev \
        libcap-dev \
        libcdb-dev \
        libcurl4-openssl-dev \
        libedit-dev \
        libfstrm-dev \
        libgeoip-dev \
        libgnutls28-dev \
        libh2o-evloop-dev \
        libkrb5-dev \
        libldap2-dev \
        liblmdb-dev \
        liblua5.3-dev \
        libmaxminddb-dev \
        libnghttp2-dev \
        libp11-kit-dev \
        libpq-dev \
        libre2-dev \
        libsnmp-dev \
        libsodium-dev \
        libsqlite3-dev \
        libssl-dev \
        libsystemd-dev \
        libwslay-dev \
        libyaml-cpp-dev \
        ragel \
        unixodbc-dev

pushd ${PDNS_SW_DIR}

git checkout $1

cd pdns/recursordist
autoreconf -vfi
./configure --enable-unit-tests --enable-nod --enable-dnstap CFLAGS='-O0' CXXFLAGS='-O0'
make -j2 -C ext
make htmlfiles.h
make -j2 pdns_recursor rec_control

ln -s ${PDNS_SW_DIR}/pdns/recursordist/pdns_recursor ${PDNS_BIN_DIR}/pdns_recursor
ln -s ${PDNS_SW_DIR}/pdns/recursordist/rec_control ${PDNS_BIN_DIR}/rec_control

popd

# Link configuration
mkdir -p /var/run/pdns-recursor
mkdir -p /var/lib/powerdns/
mkdir -p ${PDNS_CONFIG_DIR}
ln -s /tmp/powerdns/* ${PDNS_CONFIG_DIR}

# Start Recursor
${PDNS_BIN_DIR}/pdns_recursor ${ADDITIONAL_PARAMS_REC} --config-dir=${PDNS_CONFIG_DIR} --daemon

echo "[DONE]" && exit 0
