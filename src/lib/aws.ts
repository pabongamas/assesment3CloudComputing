import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const REGION = process.env.AWS_REGION || "us-east-1";

// Create an S3 client service object
// Note: If credentials are not provided in env, the SDK will attempt to load them
// from the shared credentials file or IAM role (perfect for EC2).
export const s3Client = new S3Client({
    region: REGION,
});

// Create a DynamoDB client service object
const dbClient = new DynamoDBClient({
    region: REGION,
});

// Create the DynamoDB Document client
export const ddbDocClient = DynamoDBDocumentClient.from(dbClient);

export const BUCKET_NAME = process.env.S3_BUCKET_NAME || "";
export const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "";
export const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN || "";
