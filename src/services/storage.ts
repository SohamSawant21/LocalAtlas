import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { logger } from "@/lib/logger";

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock',
  },
  // Useful for local testing with minio or localstack
  endpoint: process.env.AWS_S3_ENDPOINT,
  forcePathStyle: !!process.env.AWS_S3_ENDPOINT,
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'localatlas-uploads';

export async function generatePresignedUrl(fileType: string, fileSize: number, folder = 'contributions') {
  // Validate file type
  if (!fileType.startsWith('image/')) {
    throw new Error('Invalid file type. Only images are allowed.');
  }

  // Validate size (max 5MB)
  if (fileSize > 5 * 1024 * 1024) {
    throw new Error('File size exceeds 5MB limit.');
  }

  const extension = fileType.split('/')[1];
  const fileName = `${folder}/${uuidv4()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    ContentType: fileType,
  });

  try {
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    const publicUrl = process.env.AWS_S3_ENDPOINT 
      ? `${process.env.AWS_S3_ENDPOINT}/${BUCKET_NAME}/${fileName}`
      : `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileName}`;

    return { presignedUrl, publicUrl, fileName };
  } catch (error) {
    logger.error({ error }, 'Failed to generate presigned URL');
    throw new Error('Failed to initialize upload');
  }
}

export async function deleteFile(fileName: string) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
  });

  try {
    await s3.send(command);
  } catch (error) {
    logger.error({ error }, 'Failed to delete file from S3');
  }
}
