#!/bin/bash
input=$1
PATH="/home/iobio/iobio/tools/icgc-storage-client/data/aws/"

FULL_NAME=$PATH$input

/bin/dd if=$FULL_NAME bs=1048576 > /dev/null
cmd="/bin/cat \"$FULL_NAME\" | /home/iobio/iobio/bin/bamReadDepther"
eval $cmd