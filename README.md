AWS Cloud Monitoring & Auto-Scaling Demo (with DynamoDB)
========================================================

Pre-requisites:
- AWS CLI configured (aws configure) with credentials that can create CloudFormation stacks and resources
- jq (optional, for parsing CLI responses)
- An EC2 KeyPair in the chosen region
- VPC ID and at least two public Subnet IDs in that VPC

Step 0 — find VPC and Subnet IDs (if you don't know them)
- List VPCs:
  aws ec2 describe-vpcs --query "Vpcs[*].{Id:VpcId,State:State}" --output table
- List subnets in a VPC:
  aws ec2 describe-subnets --filters "Name=vpc-id,Values=<your-vpc-id>" --query "Subnets[*].{Id:SubnetId,AZ:AvailabilityZone}" --output table

Step 1 — Create the stack (example)
aws cloudformation create-stack \
  --stack-name aws-cloud-monitor-demo \
  --template-body file://cloudformation/stack.yml \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
  --parameters \
    ParameterKey=KeyName,ParameterValue=YOUR_KEYPAIR \
    ParameterKey=VpcId,ParameterValue=YOUR_VPC_ID \
    ParameterKey=SubnetIds,ParameterValue="subnet-aaa,subnet-bbb" \
    ParameterKey=SSHLocation,ParameterValue=YOUR_IP/32

Step 2 — Wait for stack to be CREATE_COMPLETE
aws cloudformation wait stack-create-complete --stack-name aws-cloud-monitor-demo

Step 3 — Get outputs (ALB DNS, DynamoDB table name)
aws cloudformation describe-stacks --stack-name aws-cloud-monitor-demo --query "Stacks[0].Outputs" --output table

Open the ALB DNS in your browser; the app responds with JSON like:
{
  "hostname": "ip-...",
  "uptime_seconds": ...,
  "path": "/",
  "visits": 3,
  ...
}

Testing scaling:
- SSH to an instance (get instance IDs via ASG or describe-instances)
- Run the stress script or use the in-repo stress.sh to force CPU
- The HighCPUAlarm (CPU > 60% for ~2 periods) will trigger scaling up (ASG min=1 max=2)

Cleanup:
- Delete the stack:
  aws cloudformation delete-stack --stack-name aws-cloud-monitor-demo
- This deletes EC2, ALB, ASG, DynamoDB table, SNS topic, etc.

Cost tips:
- Use t2.micro / t3.micro (free-tier when eligible)
- Keep min=1 and max=2; delete stack after demo
- DynamoDB uses PAY_PER_REQUEST (small/cheap for demo)
