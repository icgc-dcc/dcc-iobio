#!/bin/sh
if [ -s "/home/iobio/iobio/tools/icgc-storage-client/data/collab/"$1 ];
then
    path='/home/iobio/iobio/tools/icgc-storage-client/data/collab/'
else
    path='/home/iobio/iobio/tools/icgc-storage-client/data/aws/'
fi
/home/iobio/iobio/tools/samtools view -H $path$1
