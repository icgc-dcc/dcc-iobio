#!/usr/bin/python
import sys
import json
import subprocess
import os

arg1 = sys.argv[1]
arg2 = sys.argv[2]
input_json = json.loads(arg1)

sam_regions = []
for region in input_json:
    new_arg = ' ' + str(region['chr']) + ':' + str(region['start']) + '-' + str(region['end'])
    sam_regions.append(new_arg)

if (os.stat("/home/iobio/iobio/tools/icgc-storage-client/data/collab/" + arg2).st_size != 0):
    path="/home/iobio/iobio/tools/icgc-storage-client/data/collab/" + arg2
else:
    path="/home/iobio/iobio/tools/icgc-storage-client/data/aws/" + arg2

bsa_cmd = ["/home/iobio/iobio/bin/bamstatsAlive", "-u", "500", "-k", "1", "-r", sys.argv[1]]
st_cmd = ["/home/iobio/iobio/bin/samtools", "view", "-b", path]
st_cmd.extend(sam_regions)

st = subprocess.Popen(st_cmd, stdout=subprocess.PIPE)
bsa = subprocess.Popen(bsa_cmd, stdin=st.stdout)
bsa.communicate()
