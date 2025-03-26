# LocalStack S3 Browser

A web application built with Next.js for browsing S3 buckets and objects in LocalStack.

## Features

- List all S3 buckets in LocalStack
- Browse objects within buckets
- Navigate through folders
- Download objects
- Create new buckets

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (v6 or higher)
- [LocalStack](https://localstack.cloud/) running with S3 services enabled

## Setting up LocalStack

1. Install LocalStack following the [official documentation](https://docs.localstack.cloud/getting-started/installation/)

2. Start LocalStack with S3 services:
   ```bash
   localstack start
   ```

3. Verify that LocalStack is running:
   ```bash
   curl http://localhost:4566/health
   ```

   You should see S3 in the list of running services.

## Running the project

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd localstack-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Environment Configuration

By default, the application connects to LocalStack at `http://localhost:4566`. If your LocalStack is running on a different host or port, you can modify the `.env` file:

```
LOCALSTACK_ENDPOINT=http://your-localstack-host:port
```

## Creating Test Data

You can create test buckets and upload objects using the AWS CLI with the LocalStack endpoint:

```bash
# Configure AWS CLI to use LocalStack
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1

# Create a bucket
aws --endpoint-url=http://localhost:4566 s3 mb s3://my-test-bucket

# Upload a file
aws --endpoint-url=http://localhost:4566 s3 cp ./example.txt s3://my-test-bucket/

# List buckets
aws --endpoint-url=http://localhost:4566 s3 ls
```

## Building

To build the application:

```bash
npm run build
```

Then start the server:

```bash
npm start
```

## License

[MIT](LICENSE)