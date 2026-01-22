import { NextRequest, NextResponse } from "next/server";
import { s3Client, ddbDocClient, BUCKET_NAME, TABLE_NAME, CLOUDFRONT_DOMAIN } from "@/lib/aws";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const title = formData.get("title") as string || "Untitled";
        const description = formData.get("description") as string || "";

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileId = uuidv4();
        // Sanitize filename to avoid weird character issues in S3 keys
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const key = `uploads/${fileId}-${sanitizedFileName}`;

        // Upload to S3
        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: file.type,
        }));

        // Construct Public URL
        // If CloudFront is configured, use it. Otherwise use S3 direct link.
        let imageUrl = "";
        if (CLOUDFRONT_DOMAIN) {
            imageUrl = `https://${CLOUDFRONT_DOMAIN}/${key}`;
        } else {
            imageUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
        }

        // Save to DynamoDB
        const item = {
            id: fileId,
            title,
            description,
            imageUrl,
            s3Key: key,
            createdAt: new Date().toISOString(),
        };

        await ddbDocClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: item,
        }));

        return NextResponse.json(item);

    } catch (error: any) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
    }
}
