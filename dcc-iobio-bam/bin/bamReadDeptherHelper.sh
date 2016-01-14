#!/bin/bash
input=$1
if [ -s "/home/iobio/iobio/tools/icgc-storage-client/data/collab/"$input ];
then
    PATH='/home/iobio/iobio/tools/icgc-storage-client/data/collab/'
else
    PATH='/home/iobio/iobio/tools/icgc-storage-client/data/aws/'
fi

FULL_NAME=$PATH$input

# We are applying dd to the bai file and redirecting it to /dev/null because we want to
# cache it to the operating system, before applying cat to it. This is to avoid the many
# connections that the storage client will have to make, since the buffer is small.
/bin/dd if=$FULL_NAME bs=1048576 > /dev/null
cmd="/bin/cat \"$FULL_NAME\" | /home/iobio/iobio/bin/bamReadDepther"
eval $cmd
