#!/usr/bin/env python3
import os
import boto3
from botocore.exceptions import ClientError
from flask import Flask, render_template, request, redirect, url_for, send_file
from dotenv import load_dotenv
import tempfile

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Configure S3 client to use LocalStack
S3_ENDPOINT = os.getenv('LOCALSTACK_ENDPOINT', 'http://localhost:4566')
s3_client = boto3.client(
    's3',
    endpoint_url=S3_ENDPOINT,
    aws_access_key_id='test',
    aws_secret_access_key='test',
    region_name='us-east-1'
)

@app.route('/')
def index():
    """List all buckets in LocalStack S3"""
    try:
        buckets = s3_client.list_buckets()['Buckets']
        return render_template('index.html', buckets=buckets)
    except ClientError as e:
        error_message = f"Error connecting to LocalStack S3: {str(e)}"
        return render_template('error.html', error=error_message)

@app.route('/bucket/<bucket_name>')
def list_objects(bucket_name):
    """List objects in a specific bucket"""
    try:
        prefix = request.args.get('prefix', '')
        delimiter = request.args.get('delimiter', '/')
        
        # Handle pagination
        continuation_token = request.args.get('continuation_token', None)
        
        # List objects in the bucket
        kwargs = {
            'Bucket': bucket_name,
            'Delimiter': delimiter,
            'MaxKeys': 1000
        }
        
        if prefix:
            kwargs['Prefix'] = prefix
            
        if continuation_token:
            kwargs['ContinuationToken'] = continuation_token
            
        response = s3_client.list_objects_v2(**kwargs)
        
        # Process folders (CommonPrefixes)
        folders = [prefix['Prefix'] for prefix in response.get('CommonPrefixes', [])]
        
        # Process objects
        objects = response.get('Contents', [])
        
        # Check if there are more objects
        next_token = response.get('NextContinuationToken', None)
        
        # Get parent folder path for navigation
        parent_prefix = None
        if prefix:
            prefix_parts = prefix.split('/')
            if len(prefix_parts) > 1:
                parent_prefix = '/'.join(prefix_parts[:-1]) + '/'
        
        return render_template(
            'bucket.html',
            bucket_name=bucket_name,
            objects=objects,
            folders=folders,
            prefix=prefix,
            parent_prefix=parent_prefix,
            next_token=next_token
        )
    except ClientError as e:
        error_message = f"Error listing objects in bucket {bucket_name}: {str(e)}"
        return render_template('error.html', error=error_message)

@app.route('/download/<bucket_name>/<path:object_key>')
def download_object(bucket_name, object_key):
    """Download an object from S3"""
    try:
        # Get the object from S3
        response = s3_client.get_object(Bucket=bucket_name, Key=object_key)
        
        # Get object data
        object_data = response['Body'].read()
        
        # Create a temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False)
        temp_file.write(object_data)
        temp_file.close()
        
        # Get filename from object key
        filename = object_key.split('/')[-1]
        
        # Send the file to the user
        return send_file(
            temp_file.name,
            as_attachment=True,
            download_name=filename,
            mimetype=response.get('ContentType', 'application/octet-stream')
        )
    except ClientError as e:
        error_message = f"Error downloading object {object_key}: {str(e)}"
        return render_template('error.html', error=error_message)

@app.route('/create_bucket', methods=['POST'])
def create_bucket():
    """Create a new S3 bucket"""
    bucket_name = request.form.get('bucket_name')
    try:
        s3_client.create_bucket(Bucket=bucket_name)
        return redirect(url_for('index'))
    except ClientError as e:
        error_message = f"Error creating bucket {bucket_name}: {str(e)}"
        return render_template('error.html', error=error_message)

if __name__ == '__main__':
    app.run(debug=True)