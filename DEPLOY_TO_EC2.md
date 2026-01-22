# Deploying to AWS EC2 with CloudFront

This guide will walk you through deploying your Next.js application to an AWS EC2 instance and setting up CloudFront for content delivery.

## Prerequisites

- AWS Account
- The `SETUP_AWS_RESOURCES.md` steps completed (DynamoDB and S3 created).

---

## Part 1: Infrastructure Setup

### 1. Create an IAM Role for EC2
This role allows your EC2 instance to access S3 and DynamoDB securely without storing API keys in a `.env` file.

1.  Go to **IAM** > **Roles** > **Create role**.
2.  Select **AWS service** and choose **EC2**.
3.  Add permissions:
    -   `AmazonS3FullAccess`
    -   `AmazonDynamoDBFullAccess`
4.  Name the role: `NextAppEC2Role`.
5.  Create the role.

### 2. Launch an EC2 Instance
1.  Go to **EC2** > **Launch Instances**.
2.  **Name**: `NextJsApp`.
3.  **OS**: Amazon Linux 2023 AMI (Free tier eligible).
4.  **Instance Type**: `t2.micro` (Free tier) or `t3.small` (recommended for build performance).
5.  **Key pair**: Create a new key pair (e.g., `my-key`) and download the `.pem` file.
6.  **Network settings**:
    -   Create security group.
    -   Allow **SSH** from Anywhere (or My IP).
    -   Allow **HTTP** from Anywhere.
    -   Allow **HTTPS** from Anywhere.
7.  **Advanced details** > **IAM instance profile**: Select `NextAppEC2Role`.
8.  **Launch Instance**.

### 3. Set up CloudFront (CDN)
1.  Go to **CloudFront** > **Create distribution**.
2.  **Origin domain**: Select your S3 bucket.
3.  **Origin access**:
    -   Choose **Origin access control settings (recommended)**.
    -   Click **Create control setting** (Defaults are fine).
    -   *Note: You will need to update your S3 Bucket Policy after creating the distribution. CloudFront will give you the policy to copy.*
4.  **Viewer protocol policy**: Redirect HTTP to HTTPS.
5.  **Web Application Firewall (WAF)**: Do not enable security protections (for now, to avoid costs/complexity).
6.  **Create Distribution**.
7.  **Important**: After creation, copy the **Distribution Domain Name** (e.g., `d1234.cloudfront.net`).
8.  **Update S3 Policy**: In the Distribution details, go to "Origins", select the origin, click "Edit", and follow instructions to "Copy policy" if prompted, or verify your S3 bucket allows public access (if you skipped OAC and kept the bucket public as per previous setup).
    -   *If you kept the bucket public*: You technically don't need OAC, but CloudFront is still faster.
    -   *Best Practice*: Use OAC and block all public access on S3, allowing only CloudFront to read.

---

## Part 2: Connect and Deploy

### 1. Connect to your Instance
Open your terminal (on Windows use PowerShell or Command Prompt, or Git Bash):

```bash
# Set permissions for key (Linux/Mac/Git Bash only)
chmod 400 my-key.pem

# SSH into the instance
ssh -i "path/to/my-key.pem" ec2-user@<YOUR_EC2_PUBLIC_IP>
```

### 2. Install Dependencies on EC2
Run the following commands on the EC2 instance to install Docker and Git:

```bash
# Update system
sudo dnf update -y

# Install Docker
sudo dnf install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Git
sudo dnf install git -y

# Logout and log back in for docker group to take effect
exit
```
Reconnect via SSH.

### 3. Deploy the Application
Now, let's clone (or copy) the code and run it.

```bash
# Clone your repository (You might need to use HTTPS or setup SSH keys for GitHub)
# Use your actual repository URL
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git app

# Or if you don't have a git repo yet, you can copy files using scp manually, but git is easier.
# For now, let's assume you transfer the files or clone.

cd app

# Build the Docker image
docker build -t nextjs-app .

# Run the container
# Replace values with your actual resources
docker run -d -p 80:3000 \
  -e S3_BUCKET_NAME="YOUR_BUCKET_NAME" \
  -e DYNAMODB_TABLE_NAME="YOUR_TABLE_NAME" \
  -e CLOUDFRONT_DOMAIN="d12345.cloudfront.net" \
  -e AWS_REGION="us-east-1" \
  --restart always \
  nextjs-app
```

*Note: Since we attached an IAM Role, we don't need `AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY`!*

### 4. Verify
Open your browser and visit: `http://<YOUR_EC2_PUBLIC_IP>`

You should see your app running!

---

## Part 3: Switching to CloudFront
The application code has been updated to check for the `CLOUDFRONT_DOMAIN` environment variable.
- If you passed it in the `docker run` command, new uploads will save images with the CloudFront URL.
- Existing images in DynamoDB will still have S3 URLs (unless you manually update them in the database).

To force all new images to use CloudFront, ensure `CLOUDFRONT_DOMAIN` is set correctly in the docker run command.
