# AWS Resources Setup Guide

Follow these steps to configure your AWS environment to work with this application.

## 1. Configure DynamoDB (Database)

We need a table to store the metadata (Title, Description, etc.) of your uploads.

1.  Log in to the **AWS Console** and search for **DynamoDB**.
2.  Click **Create table**.
3.  **Table details**:
    -   **Table name**: Enter a name (e.g., `Assessment3-Images`).
    -   **Partition key**: Enter `id` (exactly as written, logic depends on this name).
    -   Select **String** as the type.
    -   *Leave "Sort key" empty*.
4.  **Table settings**: Default settings are fine (On-demand capacity mode is recommended for testing to avoid costs).
5.  Click **Create table**.
6.  **Important**: Copy the Table Name into your `.env.local` file under `DYNAMODB_TABLE_NAME`.

## 2. Configure S3 (File Storage)

We need a bucket to store the actual image files. For this demo, we will configure it to allow public read access so the images can be displayed easily.

### Step A: Create Bucket
1.  Search for **S3** in the AWS Console.
2.  Click **Create bucket**.
3.  **Bucket name**: Enter a globally unique name (e.g., `my-unique-assessment-bucket-123`).
4.  **Region**: Choose the same region as your DynamoDB table (e.g., `us-east-1`).
5.  **Object Ownership**: Select **ACLs enabled** (optional, but "Bucket owner preferred" is standard now).
6.  **Block Public Access settings for this bucket**:
    -   **Uncheck** "Block all public access".
    -   Check the confirmation box saying "I acknowledge that the current settings might result in this bucket and the objects within becoming public."
    -   *(Note: This is necessary for the current app implementation to display images via simple URLs).*
7.  Click **Create bucket**.

### Step B: Add Bucket Policy (Public Read)
1.  Click on your newly created bucket name.
2.  Go to the **Permissions** tab.
3.  Scroll down to **Bucket policy** and click **Edit**.
4.  Paste the following JSON (Replace `YOUR_BUCKET_NAME` with your actual bucket name):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
        }
    ]
}
```
5.  Click **Save changes**.
6.  **Important**: Copy the Bucket Name into your `.env.local` file under `S3_BUCKET_NAME`.

## 3. Configure IAM Credentials (For Local/Docker App)

The application needs permission to talk to AWS.

**(Option A: Access Keys - Easiest for Local)**
1.  Search for **IAM** in the console.
2.  Go to **Users** -> **Create user**.
3.  Name: `NextJsAppUser`.
4.  **Permissions options**: Select "Attach policies directly".
5.  Search for and add:
    -   `AmazonS3FullAccess`
    -   `AmazonDynamoDBFullAccess`
    -   *(In a real production app, you would create a custom minimal policy, but this is fine for an assessment).*
6.  Create the user.
7.  Click on the user -> **Security credentials** tab.
8.  Scroll to **Access keys** -> **Create access key**.
9.  Select **Local code**.
10. Copy the **Access Key ID** and **Secret Access Key** into your `.env.local` file.

**(Option B: EC2 Setup)**
If you are running this on an EC2 instance, you don't need `.env` credentials. Instead:
1.  Create an IAM Role with the permissions above.
2.  Attach the Role to your EC2 instance.
3.  The AWS SDK will automatically detect the role.
