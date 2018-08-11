#!/bin/sh

bin/bootstrap.sh
source config.sh

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
StackNamePrefix=${STACK_PREFIX} \
CertificateArn=${CERTIFICATE_ARN} \
DomainName=${DOMAIN_NAME} \
HostedZoneName=${HOSTED_ZONE_NAME}


API_URL=$(aws cloudformation describe-stacks \
--profile nonprodadmin \
--stack-name ${STACK_NAME} \
--query 'Stacks[0].Outputs[?OutputKey==`SearchApi`].OutputValue' \
--output text)

echo "API Available at ${API_URL}"
