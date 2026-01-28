# Deploying to AWS Amplify

Yes! It is absolutely possible to use AWS Amplify instead of EC2. In fact, Amplify is often the **recommended** way to host Next.js applications on AWS because it handles the build process, CDN (CloudFront), and scaling automatically.

## Differences from EC2
- **No Docker needed**: Amplify builds directly from your source code (GitHub/GitLab/Bitbucket). You can ignore the `Dockerfile`.
- **Managed Infrastructure**: You don't manage servers or OS updates.
- **Easy CI/CD**: Every time you push to git, Amplify redeploys.

---

## Step 1: Push your code to a Git Provider
If you haven't already, push your code to GitHub, GitLab, or AWS CodeCommit.
*(Amplify needs access to your repository to build the app)*.

## Step 2: Create Amplify App
1.  Log in to the **AWS Console** and go to **AWS Amplify**.
2.  Click **Create new app** > **Gen 1** (or "Web App" depending on the new UI, look for "Host web app").
    *   *Note: Gen 2 is code-first, Gen 1 is console-first. For an existing app like this, the simple "Host web app" flow (likely Gen 1/Hosting) is easiest.*
3.  **Choose your repository provider** (e.g., GitHub).
4.  Authorize AWS Amplify to access your account.
5.  **Select the repository** and the **branch** (e.g., `main`).
6.  Click **Next**.

## Step 3: Configure Build Settings
Amplify will auto-detect that it is a Next.js app.

1.  **Build settings**: The default detected settings are usually correct (`npm run build`).
2.  **Environment Variables**: This is CRITICAL. You must add the variables here so the code knows which Database/Bucket to use.
    *   Click **Advanced settings**.
    *   Add the following Key-Value pairs:
        *   `DYNAMODB_TABLE_NAME` = (Your real table name, e.g., `Assessment3-Images`)
        *   `S3_BUCKET_NAME` = (Your real bucket name)
        *   `AWS_REGION` = `us-east-1` (or your region)
        *   `CLOUDFRONT_DOMAIN` = (Optional: Your manually created CloudFront domain if you want to use it for images, e.g. `d123.cloudfront.net`. If you omit this, it will fall back to S3 URLs).

3.  **Service Role (IMPORTANT)**: 
    *   By default, Amplify builds the app but doesn't give it permission to access *other* AWS resources like DynamoDB or S3 at runtime (SSR).
    *   You need to create a **Service Role** for Amplify or edit the one it creates.
    *   **Create a new IAM Role** (if you don't have one to select):
        1.  Go to **IAM** > **Roles** > **Create role**.
        2.  Trusted entity type: **AWS Service**.
        3.  Service: **Amplify**.
        4.  Permissions: Add `AdministratorAccess-Amplify` (for build) AND...
        5.  **CRITICAL**: You must also attach `AmazonS3FullAccess` and `AmazonDynamoDBFullAccess` (or specific policies for your resources) to this role so the Next.js API routes can read/write.
        6.  Name it `AmplifyNextAppRole`.
    *   Back in Amplify Build Settings: Select this `AmplifyNextAppRole` (or "Create new role" flow).

4.  Click **Next** and **Save and Deploy**.

## Step 4: Adjust Permissions (If 'Access Denied' errors occur)
In newer Amplify (Next.js 13+ support), the backend code (API routes) runs on Lambda@Edge or generic Lambda. These resources execute using an "Execution Role".

Sometimes the "Build" role selected in the console is just for building. If you deploy and get "Access Denied" when uploading:
1.  Go to **IAM**.
2.  Look for the role automatically created for your Amplify app's compute usually named `AmplifySSR...` or similar, OR ensure the role you assigned in Step 3 is actually attached to the compute resources.
    *   *Simplest Fix*: Once the app is deployed, go to **Amplify Console** > **App settings** > **General** > **Service role**. Ensure that role has the S3 and DynamoDB permissions.

## Step 5: Test
1.  Wait for the build to complete.
2.  Click the provided URL (e.g., `https://main.d123.amplifyapp.com`).
3.  Try uploading an image.

### Note on CloudFront
Since Amplify *is* a CDN, your **application** is already behind CloudFront.
However, your **images** are still in S3.
*   If you provided `CLOUDFRONT_DOMAIN` in Step 3, your app will generate URLs using that distribution for the images.
*   If you didn't, it will link directly to S3.
*   Both work!

