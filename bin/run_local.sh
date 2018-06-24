#!/bin/sh

usage()
{
    echo "usage: run_local.sh -p stack_name_prefix | [-h]"
}

while [ "$1" != "" ]; do
    case $1 in
        -p | --stack-name-prefix )           shift
                                STACK_NAME_PREFIX=$1
                                ;;
        -h | --help )           usage
                                exit
                                ;;
        * )                     usage
                                exit 1
    esac
    shift
done

if [ -z ${STACK_NAME_PREFIX+x} ]; then
  echo "STACK_NAME_PREFIX is required"
  usage
  exit 1
fi

sam local start-api
