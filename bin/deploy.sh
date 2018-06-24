#!/bin/sh

usage()
{
    echo "usage: deploy.sh -p stack_name_prefix | [-h]"
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

STACK_NAME="${STACK_NAME_PREFIX}-cmr-stac-api"
STACK_DEPLOY_BUCKET=${STACK_NAME}

echo "Deploying to stack $STACK_NAME"


## Make sure bucket is available

if ! aws s3api head-bucket --profile nonprodadmin --bucket "${STACK_DEPLOY_BUCKET}" 2>/dev/null ; then
  echo "Creating bucket ${STACK_DEPLOY_BUCKET}"
  aws s3api create-bucket --profile nonprodadmin  --bucket "${STACK_DEPLOY_BUCKET}"
fi

echo "Packaging..."
aws cloudformation package --template-file ./template.yaml \
--profile nonprodadmin \
--output-template-file serverless-output.yml \
--s3-bucket "${STACK_DEPLOY_BUCKET}"

echo "Deploying..."
aws cloudformation deploy --template-file ./serverless-output.yml \
--profile nonprodadmin \
--stack-name "${STACK_NAME}" \
--capabilities CAPABILITY_IAM \
--parameter-overrides \
StackNamePrefix=${STACK_PREFIX}


API_URL=$(aws cloudformation describe-stacks \
--profile nonprodadmin \
--stack-name ${STACK_NAME} \
--query 'Stacks[0].Outputs[?OutputKey==`SearchApi`].OutputValue' \
--output text)

echo "API Available at ${API_URL}"
