#     ______________________   ____      __    _          ____  ___    __  ___
#    /  _/ ____/ ____/ ____/  /  _/___  / /_  (_)___     / __ )/   |  /  |/  /
#    / // /   / / __/ /       / // __ \/ __ \/ / __ \   / __  / /| | / /|_/ / 
#  _/ // /___/ /_/ / /___   _/ // /_/ / /_/ / / /_/ /  / /_/ / ___ |/ /  / /  
# /___/\____/\____/\____/  /___/\____/_.___/_/\____/  /_____/_/  |_/_/  /_/   
#
# Banner @ http://goo.gl/Uc4YXy

# Copyright (c) 2016 The Ontario Institute for Cancer Research. All rights reserved.                            
#
# This program and the accompanying materials are made available under the terms of the GNU Public License v3.0.
# You should have received a copy of the GNU General Public License along with                                 
# this program. If not, see <http://www.gnu.org/licenses/>.                                                    
#                                                                                                              
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY                          
# EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES                         
# OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT                          
# SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,                               
# INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED                         
# TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;                              
# OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER                             
# IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN                        
# ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

#                                                                            
# Extend new iobio image
#

FROM qiaoy/iobio-bundle.bam-iobio:secure

#
# Install java 8
# Based on:
# https://hub.docker.com/r/frolvlad/alpine-glibc/~/dockerfile/
# https://hub.docker.com/r/frolvlad/alpine-oraclejdk8/~/dockerfile/
#

RUN apk add --update wget ca-certificates && \
    export ALPINE_GLIBC_BASE_URL="https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.21-r2/" && \
    export ALPINE_GLIBC_PACKAGE="glibc-2.21-r2.apk" && \
    export ALPINE_GLIBC_BIN_PACKAGE="glibc-bin-2.21-r2.apk" && \
    wget "$ALPINE_GLIBC_BASE_URL/$ALPINE_GLIBC_PACKAGE" "$ALPINE_GLIBC_BASE_URL/$ALPINE_GLIBC_BIN_PACKAGE" && \
    apk add --allow-untrusted "$ALPINE_GLIBC_PACKAGE" "$ALPINE_GLIBC_BIN_PACKAGE" && \
    /usr/glibc/usr/bin/ldconfig "/lib" "/usr/glibc/usr/lib" && \
    echo 'hosts: files mdns4_minimal [NOTFOUND=return] dns mdns4' >> /etc/nsswitch.conf && \
    apk del wget ca-certificates && \
    rm "$ALPINE_GLIBC_PACKAGE" "$ALPINE_GLIBC_BIN_PACKAGE" /var/cache/apk/*

ENV JAVA_VERSION=8 \
    JAVA_UPDATE=181 \
    JAVA_BUILD=13 \
    JAVA_HOME=/usr/lib/jvm/default-jvm

RUN apk add --update wget ca-certificates && \
    cd /tmp && \
    wget --header "Cookie: oraclelicense=accept-securebackup-cookie;" \
        "http://download.oracle.com/otn-pub/java/jdk/${JAVA_VERSION}u${JAVA_UPDATE}-b${JAVA_BUILD}/96a7b8442fe848ef90c96a2fad6ed6d1/jdk-${JAVA_VERSION}u${JAVA_UPDATE}-linux-x64.tar.gz" && \
    tar xzf "jdk-${JAVA_VERSION}u${JAVA_UPDATE}-linux-x64.tar.gz" && \
    mkdir -p "/usr/lib/jvm" && \
    mv "/tmp/jdk1.${JAVA_VERSION}.0_${JAVA_UPDATE}" "/usr/lib/jvm/java-${JAVA_VERSION}-oracle" && \
    ln -s "java-${JAVA_VERSION}-oracle" "$JAVA_HOME" && \
    ln -s "$JAVA_HOME/bin/"* "/usr/bin/" && \
    rm -rf "$JAVA_HOME/"*src.zip && \
    rm -rf /tmp/* /var/cache/apk/*

#
# Install lib
#

RUN apk update
RUN apk add fuse fuse-dev

#
# Installing latest dcc-storage-client
#

RUN mkdir -p /home/iobio/iobio/tools/score-client && \
    cd /home/iobio/iobio/tools/score-client && \
    wget -qO- https://artifacts.oicr.on.ca/artifactory/dcc-pr-snapshot/bio/overture/score-client/1.4.1-SNAPSHOT/score-client-1.4.1-20180904.170646-11-dist.tar.gz | \
    tar xvz

#
# Copies icgc-storage-client folders out one directive
# Alternative for lack of tar strip-components
#

RUN cp -r /home/iobio/iobio/tools/score-client/*/* /home/iobio/iobio/tools/score-client/

#
# Makes a directory for icgc-storage-client collab and aws to mount
#

RUN mkdir /home/iobio/iobio/tools/score-client/data
RUN mkdir /home/iobio/iobio/tools/score-client/data/aws
RUN mkdir /home/iobio/iobio/tools/score-client/data/collab

#
# Adds necessary files in order to run
#

RUN npm install --prefix /home/iobio/iobio ps-tree
ADD conf/nginx.conf /etc/nginx/nginx.conf
ADD app.conf /etc/supervisor.d/

#
# Use our wrappers
#
ADD bin/bamReadDeptherHelper.sh /home/iobio/iobio/bin/
ADD bin/headerHelper.sh /home/iobio/iobio/bin/samHeaderHelper.sh
ADD bin/bamstatsAliveWrapper.sh /home/iobio/iobio/bin/bamstatsAliveWrapper.sh
ADD bin/statsWrapper.py /home/iobio/iobio/bin/statsWrapper.py
RUN chmod +x /home/iobio/iobio/bin/samHeaderHelper.sh
RUN chmod +x /home/iobio/iobio/bin/bamstatsAliveWrapper.sh
RUN chmod +x /home/iobio/iobio/bin/statsWrapper.py

ADD services/bamstatsalive.js /home/iobio/iobio/services/bamstatsalive.js

#
# Modify their backend code
#

ADD lib/cmd.js /home/iobio/iobio/lib/cmd.js
ADD lib/server.js /home/iobio/iobio/lib/server.js

#
# Add landing page for the server
#
ADD www/index.html /var/www/html/index.html
ADD www/favicon.ico /var/www/html/favicon.ico

#
# Add cleanup script
#
ADD bin/cleaner.sh /home/iobio/iobio/bin/cleaner.sh
RUN chmod +x /home/iobio/iobio/bin/cleaner.sh

#
# Use the bam.iobio entrypoint
#

ENTRYPOINT ["/entrypoint.sh"]
