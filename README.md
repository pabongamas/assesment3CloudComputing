# AWS Cloud Deployment Assessment

This Next.js application demonstrates a cloud-native architecture using AWS EC2, S3, and DynamoDB.

## Features

- **Upload to S3**: Securely upload images to an AWS S3 bucket.
- **Metadata in DynamoDB**: Store document metadata (Title, Description, S3 Key, URL) in DynamoDB.
- **CRUD Operations**: Full Create, Read, Update, Delete functionality.
- **Dockerized**: Ready for deployment on EC2 via Docker.
- **Premium UI**: Modern, responsive dark-mode interface.

## Prerequisites

- AWS Account
- S3 Bucket (Public Read or Presigned URLs enabled, CORS configured)
- DynamoDB Table (Partition Key: `id` (String))
- Node.js & npm (Locally) or Docker

## Setup & Run

1.  **Environment Variables**:
    Copy `.env.local.example` to `.env.local` and fill in your AWS credentials and resource names.

    ```bash
    cp .env.local.example .env.local
    ```

2.  **Install Dependencies**:

    ```bash
    npm install
    ```

3.  **Run Development Server**:

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000).

## Docker Deployment (EC2)

1.  **Build Image**:

    ```bash
    docker build -t assessment3-app .
    ```

2.  **Run Container**:
    (Ensure you pass env vars or have IAM role attached to EC2)

    ```bash
    docker run -p 3000:3000 -e S3_BUCKET_NAME=... -e DYNAMODB_TABLE_NAME=... assessment3-app
    ```
