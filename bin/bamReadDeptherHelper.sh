#!/bin/bash
input=$1
if [ -s "/home/iobio/iobio/tools/icgc-storage-client/data/collab/"$input ];
then
    PATH='/home/iobio/iobio/tools/icgc-storage-client/data/collab/'
else
    PATH='/home/iobio/iobio/tools/icgc-storage-client/data/aws/'
fi

FULL_NAME=$PATH$input

/bin/dd if=$FULL_NAME bs=1048576 > /dev/null
cmd="/bin/cat \"$FULL_NAME\" | /home/iobio/iobio/bin/bamReadDepther"
eval $cmd
