ICGC DCC - bam.iobio
===

A means to sample and view very large BAM files in less than 15 seconds.

Run
---
To run, you must have a valid authentication token. If you have DACO access, this can be retrieved from the portal.
 1. Export ACCESSTOKEN variable so we can use it later: `export ACCESSTOKEN="your access token"`.

 This is to avoid being able to see the ACCESSTOKEN when the container is running, using `ps -ef`, or something along those lines
 2. Set PUB_HTTP_PORT as a port number, and export PUB_HTTP_PORT variable. This variable is the port that will be mapped into the container: `export PUB_HTTP_PORT="your desired port"`
 3. Run `docker run -it         -p $PUB_HTTP_PORT:80         -e "PUB_HOSTNAME=<your hostname>"         -e "PUB_HTTP_PORT=80"     -e ACCESSTOKEN=$ACCESSTOKEN --privileged icgc/icgc-iobio-bam`.

Note: The application uses dcc-storage-client to mount the sensitive files (which is why you needed an access token). This process takes around 10-15 seconds. Please allow 10-15 seconds after running the container before using.
