ICGC DCC - bam.iobio
===

A means to sample and view very large ICGC BAM files in less than 15 seconds.

Introduction
---
[iobio](http://iobio.io/) is a team of developers situated in the Marth lab at the Center for Genetic Discovery at the University of Utah. iobio's goal is to make understanding complex genomic datasets more intuitive, and the analysis more interactive, by streaming and displaying visual feedback. [Bam.iobio](http://bam.iobio.io/) uses front-end code that can be found [here](https://github.com/chmille4/bam.iobio.io), that interacts with a [docker image](https://hub.docker.com/r/qiaoy/iobio-bundle.bam-iobio/) which reads and processes data, and streams back the generated metrics through websockets. Bam.iobio was originally designed to handle open-access data, however this use-case required us to implement security changes, since we are working with sensitive data. These requirements required us to implement our own docker image, extending from their existing one.

Security Changes
---
 1. Pushed samtools into the container; now the front end has no access to samtools directly.
 2. Wrapped all services with a wrapper; the front end no longer builds the shell command string. The front end sends the necessary fields to the wrapper in the container, and the wrapper creates the bash command.
 3. Removed unused websocket connections
 4. Removed unused nginx and supervisor configurations 

ICGC Storage Client
---
[ICGC Storage Client](https://hub.docker.com/r/icgc/icgc-storage-client/) was implemented in our extended docker container because we required a way to access sensitive data from protected repositories. Using a combination of FUSE and ICGC Storage Client, we mounted the sensitive data onto a folder within the docker container, simulating a local folder containing the sensitive data.

Run
---
To run, you must have a valid authentication token. If you have DACO access, this can be retrieved from the portal.
 1. Export `ACCESSTOKEN` variable so we can use it later: `export ACCESSTOKEN="your access token"`.

 This is to avoid being able to see the `ACCESSTOKEN` when the container is running, using `ps -ef`, or something along those lines
 2. Set `PUB_HTTP_PORT` as a port number, and export `PUB_HTTP_PORT` variable. This variable is the port that will be mapped into the container: `export PUB_HTTP_PORT="your desired port"`
 3. Run `docker run -it         -p $PUB_HTTP_PORT:80         -e "PUB_HOSTNAME=<your hostname>"         -e "PUB_HTTP_PORT=80"     -e ACCESSTOKEN=$ACCESSTOKEN --privileged icgc/icgc-iobio-bam`.

Note: The application uses ICGC Storage Client to mount the sensitive files (which is why you needed an access token). This process takes around 10-15 seconds. Please allow 10-15 seconds after running the container before using.
