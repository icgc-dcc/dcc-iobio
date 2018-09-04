#!/bin/sh
#
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

input=$1
tbi=$1".tbi"
idx=$1".idx"

if [ -s "/home/iobio/iobio/tools/score-client/data/collab/"$tbi ];
then
    FULL_NAME="/home/iobio/iobio/tools/score-client/data/collab/"$tbi
elif [ -s "/home/iobio/iobio/tools/score-client/data/collab/"$idx ];
then 
    FULL_NAME="/home/iobio/iobio/tools/score-client/data/collab/"$idx
elif [ -s "/home/iobio/iobio/tools/score-client/data/aws/"$tbi ];
then
    FULL_NAME="/home/iobio/iobio/tools/score-client/data/aws/"$tbi
else
    FULL_NAME="/home/iobio/iobio/tools/score-client/data/aws/"$idx
fi

# We are applying dd to the bai file and redirecting it to /dev/null because we want to
# cache it to the operating system, before applying cat to it. This is to avoid the many
# connections that the storage client will have to make, since the buffer is small.
/bin/dd if=$FULL_NAME bs=1048576 > /dev/null
cmd="/bin/cat \"$FULL_NAME\" | /home/iobio/iobio/bin/bgzip -d | /home/iobio/iobio/bin/vcfReadDepther"
eval $cmd