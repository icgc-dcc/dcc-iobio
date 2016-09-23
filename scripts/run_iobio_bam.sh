#!/bin/bash
export ACCESSTOKEN=""
export PUB_HTTP_PORT="80"
docker run -p $PUB_HTTP_PORT:80 -e "PUB_HOSTNAME=dcc-iobio" -e "PUB_HTTP_PORT=80" -e ACCESSTOKEN=$ACCESSTOKEN --privileged icgcdcc/dcc-iobio:latest-bam