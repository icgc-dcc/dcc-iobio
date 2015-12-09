ICGC DCC - bam.iobio container
===

Changelog for the ICGC DCC version of the bam.iobio docker container. 

1.0.1
--
 - Added tracking of spawned process PIDs and reaping of these processes when a client is closed.
 - Added script that kills and orphaned processes that get assigned to supervisord's process group.

1.0.0
--
 - Initial release of the ICGC DCC bam.iobio docker container.
 - Features security enhancements such as the move towards parameterization of input. 
 - Removal of WS/HTTP client related code and config as not a use case for ICGC and for security concerns.
 - Removal of loopback communication with samtools
 - Includes ICGC Storage Client v1.0.3