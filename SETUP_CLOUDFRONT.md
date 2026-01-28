# Setting up One-Click CloudFront for S3 Images

This guide describes how to create a CloudFront distribution to serve your S3 images faster and cheaper.

## Step 1: Create CloudFront Distribution

1.  Log in to the **AWS Console** and search for **CloudFront**.
2.  Click **Create distribution**.
3.  **Origin domain**: Select your S3 bucket (e.g., `assessment3aws.s3.us-east-1.amazonaws.com`).
4.  **Origin access**:
    *   Select **Origin access control settings (recommended)**.
    *   Click **Create control setting** (keep defaults) > **Create**.
    *   *Note: After creating the distribution, you must update your S3 bucket policy (CloudFront will provide the policy statement).*
5.  **Viewer Config**:
    *   **Viewer protocol policy**: Select **Redirect HTTP to HTTPS**.
    *   **Allowed methods**: `GET, HEAD` (Since we only read images via CloudFront).
6.  **Web Application Firewall (WAF)**:
    *   Select **Do not enable security protections** (unless you want to pay extra for WAF).
7.  Click **Create distribution**.

## Step 2: Update S3 Bucket Policy

1.  After creation, you will see a banner at the top of the distribution page: *"The S3 bucket policy needs to be updated..."*.
2.  Click **Copy policy**.
3.  Go to **S3 Console** > **Your Bucket** > **Permissions** > **Bucket Policy**.
4.  Paste the policy. It looks roughly like this:
    ```json
    {
        "Version": "2008-10-17",
        "Id": "PolicyForCloudFrontPrivateContent",
        "Statement": [
            {
                "Sid": "AllowCloudFrontServicePrincipal",
                "Effect": "Allow",
                "Principal": {
                    "Service": "cloudfront.amazonaws.com"
                },
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*",
                "Condition": {
                    "StringEquals": {
                        "AWS:SourceArn": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID"
                    }
                }
            }
        ]
    }
    ```
5.  **Save changes**.

## Step 3: Configure Application

1.  Copy your **Distribution Domain Name** (e.g., `d12345abcdef.cloudfront.net`).
2.  Update your environment variables:

    **Local Development (.env)**:
    ```bash
    CLOUDFRONT_DOMAIN=d12345abcdef.cloudfront.net
    ```

    **Production (Amplify/EC2)**:
    *   Add `CLOUDFRONT_DOMAIN` to your deployment environment variables.

## Step 4: Verification

1.  Restart your application.
2.  Upload a new image.
3.  Check the image URL. It should now start with `https://d12345abcdef.cloudfront.net/...`.
    *   *Note: Previously uploaded images stored in the database with S3 URLs `s3.amazonaws.com` will continue to work, but won't be served via CloudFront unless you manually update their URLs in the database.*

## Troubleshooting

-   **Access Denied?** Ensure the S3 Bucket Policy is correct and matches the OAC.
-   **Images not loading?** Check `next.config.ts` generally, but since we use standard `<img>` tags, it's usually a permissions issue.
