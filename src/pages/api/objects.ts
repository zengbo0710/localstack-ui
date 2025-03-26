import { NextApiRequest, NextApiResponse } from 'next';
import { s3Client } from '@/lib/s3-client';
import { ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { bucketName, prefix, delimiter, continuationToken } = req.query;
      
      if (!bucketName) {
        return res.status(400).json({ error: 'Bucket name is required' });
      }
      
      // Prepare command parameters
      const params: any = {
        Bucket: bucketName as string,
        MaxKeys: 1000
      };
      
      if (prefix) {
        params.Prefix = prefix as string;
      }
      
      if (delimiter) {
        params.Delimiter = delimiter as string;
      } else {
        params.Delimiter = '/';
      }
      
      if (continuationToken) {
        params.ContinuationToken = continuationToken as string;
      }
      
      // List objects in the bucket
      const command = new ListObjectsV2Command(params);
      const response = await s3Client.send(command);
      
      res.status(200).json(response);
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error listing objects:', error);
    res.status(500).json({ error: 'Error processing your request' });
  }
}