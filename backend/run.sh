#!/bin/bash

#Automatically export all variables
set -a

#Load .env file
source .env

#stop automatically exporting
set +a

#Run spring boot
./mvnw spring-boot:run