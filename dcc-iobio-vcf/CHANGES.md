ICGC DCC - vcf.iobio container
===

Changelog for the ICGC DCC version of the vcf.iobio docker container

v1.0.0
--
 - Initial release of the ICGC DCC vcf.iobio docker container
 - Features security enhancements such as the move towards parameterization of input
 - Removal of WS/HTTP client related code and config as not a use case for ICGC and for security concerns
 - Removal of communication with tabix
 - Includes ICGC Storage Client v1.0.12
