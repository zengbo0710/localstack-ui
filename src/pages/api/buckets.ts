import { NextApiRequest, NextApiResponse } from 'next';
import { s3Client } from '@/lib/s3-client';
import { ListBucketsCommand, CreateBucketCommand } from '@aws-sdk/client-s3';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // List all buckets
      const command = new ListBucketsCommand({});
      const response = await s3Client.send(command);
      
      res.status(200).json(response.Buckets || []);
    } else if (req.method === 'POST') {
      // Create a new bucket
      const { bucketName } = req.body;
      
      if (!bucketName) {
        return res.status(400).json({ error: 'Bucket name is required' });
      }
      
      const command = new CreateBucketCommand({
        Bucket: bucketName
      });
      
      await s3Client.send(command);
      res.status(201).json({ message: `Bucket ${bucketName} created successfully` });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error handling bucket operation:', error);
    res.status(500).json({ error: 'Error processing your request' });
  }
}