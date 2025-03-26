import { NextApiRequest, NextApiResponse } from 'next';
import { s3Client } from '@/lib/s3-client';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { bucketName, objectKey } = req.query;
      
      if (!bucketName || !objectKey) {
        return res.status(400).json({ error: 'Bucket name and object key are required' });
      }
      
      // Create command for the GetObject operation
      const command = new GetObjectCommand({
        Bucket: bucketName as string,
        Key: objectKey as string,
      });
      
      // Generate a presigned URL for the object (valid for 5 minutes)
      const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
      
      res.status(200).json({ url: presignedUrl });
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error generating download URL:', error);
    res.status(500).json({ error: 'Error processing your request' });
  }
}