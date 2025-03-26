import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';

// Configure S3 client to use LocalStack
const s3ClientConfig: S3ClientConfig = {
  endpoint: process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566',
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
  },
  forcePathStyle: true, // Required for LocalStack
};

// Create and export the S3 client
export const s3Client = new S3Client(s3ClientConfig);