import { NextRequest, NextResponse } from "next/server";
import { s3Client, ddbDocClient, BUCKET_NAME, TABLE_NAME } from "@/lib/aws";
import { ScanCommand, DeleteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function GET() {
    try {
        const data = await ddbDocClient.send(new ScanCommand({
            TableName: TABLE_NAME,
        }));
        // Sort by createdAt desc
        const items = data.Items?.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return NextResponse.json(items || []);
    } catch (error: any) {
        console.error("Fetch Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const s3Key = searchParams.get('s3Key');

        if (!id || !s3Key) {
            return NextResponse.json({ error: "Missing id or s3Key" }, { status: 400 });
        }

        // Delete from S3
        await s3Client.send(new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3Key,
        }));

        // Delete from DynamoDB
        await ddbDocClient.send(new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { id },
        }));

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Delete Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, title, description } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing id" }, { status: 400 });
        }

        await ddbDocClient.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { id },
            UpdateExpression: "set title = :t, description = :d",
            ExpressionAttributeValues: {
                ":t": title,
                ":d": description,
            },
            ReturnValues: "ALL_NEW",
        }));

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Update Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

