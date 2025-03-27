import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { FaFolder, FaFile, FaArrowUp, FaDownload } from 'react-icons/fa';

interface S3Object {
  Key: string;
  Size: number;
  LastModified: Date;
}

interface CommonPrefix {
  Prefix: string;
}

export default function BucketPage() {
  const router = useRouter();
  const { bucketName } = router.query;
  const [objects, setObjects] = useState<S3Object[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [prefix, setPrefix] = useState<string>('');
  const [parentPrefix, setParentPrefix] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [continuationToken, setContinuationToken] = useState<string | null>(null);

  // Fetch objects when bucket name or prefix changes
  useEffect(() => {
    if (bucketName) {
      const queryPrefix = Array.isArray(router.query.prefix) 
        ? router.query.prefix[0] 
        : router.query.prefix || '';
        
      setPrefix(queryPrefix);
      fetchObjects(queryPrefix);
      
      // Calculate parent prefix for navigation
      if (queryPrefix) {
        const parts = queryPrefix.split('/');
        parts.pop(); // Remove the last part
        if (parts.length > 0) {
          setParentPrefix(parts.join('/') + '/');
        } else {
          setParentPrefix('');
        }
      } else {
        setParentPrefix(null);
      }
    }
  }, [bucketName, router.query.prefix]);

  // Function to fetch objects
  const fetchObjects = async (prefixPath: string, token?: string) => {
    if (!bucketName) return;
    
    try {
      setLoading(true);
      
      let url = `/api/objects?bucketName=${encodeURIComponent(bucketName as string)}`;
      if (prefixPath) {
        url += `&prefix=${encodeURIComponent(prefixPath)}`;
      }
      if (token) {
        url += `&continuationToken=${encodeURIComponent(token)}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('S3 Response:', data); // Debug logging
      
      // Process folders (CommonPrefixes)
      const folderList = data.CommonPrefixes 
        ? data.CommonPrefixes.map((prefix: CommonPrefix) => prefix.Prefix) 
        : [];
      
      // Process objects
      const objectList = data.Contents 
        ? data.Contents
            .filter((obj: S3Object) => obj.Key !== prefixPath) // Filter out current prefix
            .map((obj: S3Object) => ({
              ...obj,
              LastModified: new Date(obj.LastModified)
            }))
        : [];
      
      setFolders(folderList);
      setObjects(objectList);
      setContinuationToken(data.NextContinuationToken || null);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching objects:', err);
      setError('Failed to load objects. Please check if LocalStack is running.');
    } finally {
      setLoading(false);
    }
  };

  // Function to download object
  const downloadObject = async (objectKey: string) => {
    try {
      const response = await fetch(`/api/download?bucketName=${encodeURIComponent(bucketName as string)}&objectKey=${encodeURIComponent(objectKey)}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Open the presigned URL in a new tab or trigger download
      window.open(data.url, '_blank');
    } catch (err: any) {
      console.error('Error downloading object:', err);
      setError('Failed to generate download link.');
    }
  };

  // Function to load more objects
  const loadMore = () => {
    if (continuationToken) {
      fetchObjects(prefix, continuationToken);
    }
  };

  // Get current path for breadcrumb
  const getBreadcrumbParts = () => {
    if (!prefix) return [];
    
    const parts = prefix.split('/').filter(Boolean);
    const breadcrumbs = [];
    
    let currentPath = '';
    for (let i = 0; i < parts.length; i++) {
      currentPath += parts[i] + '/';
      breadcrumbs.push({
        name: parts[i],
        path: currentPath
      });
    }
    
    return breadcrumbs;
  };

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Layout title={`${bucketName} - LocalStack S3 Browser`}>
      {/* Breadcrumb navigation */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/">Buckets</Link>
          </li>
          <li className="breadcrumb-item">
            <Link href={`/bucket/${encodeURIComponent(bucketName as string)}`}>
              {bucketName}
            </Link>
          </li>
          {getBreadcrumbParts().map((part, index) => (
            <li 
              key={index} 
              className={`breadcrumb-item ${index === getBreadcrumbParts().length - 1 ? 'active' : ''}`}
            >
              {index === getBreadcrumbParts().length - 1 ? (
                part.name
              ) : (
                <Link href={`/bucket/${encodeURIComponent(bucketName as string)}?prefix=${encodeURIComponent(part.path)}`}>
                  {part.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="row mb-4">
        <div className="col">
          <h2>
            {prefix ? prefix.split('/').filter(Boolean).pop() || bucketName : bucketName}
          </h2>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {loading ? (
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Size</th>
                    <th>Last Modified</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Parent directory link */}
                  {parentPrefix !== null && (
                    <tr>
                      <td>
                        <Link 
                          href={`/bucket/${encodeURIComponent(bucketName as string)}${parentPrefix ? `?prefix=${encodeURIComponent(parentPrefix)}` : ''}`}
                          className="d-flex align-items-center text-decoration-none"
                        >
                          <FaArrowUp className="me-2 text-secondary" /> ..
                        </Link>
                      </td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  )}
                  
                  {/* Folders */}
                  {folders.map((folder, index) => (
                    <tr key={`folder-${index}`}>
                      <td>
                        <Link 
                          href={`/bucket/${encodeURIComponent(bucketName as string)}?prefix=${encodeURIComponent(folder)}`}
                          className="d-flex align-items-center text-decoration-none"
                        >
                          <FaFolder className="me-2 text-warning" /> 
                          {folder.replace(prefix, '').replace(/\/$/, '')}
                        </Link>
                      </td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                    </tr>
                  ))}
                  
                  {/* Files */}
                  {objects.map((object, index) => (
                    <tr key={`object-${index}`}>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaFile className="me-2 text-secondary" /> 
                          {object.Key.replace(prefix, '')}
                        </div>
                      </td>
                      <td>{formatSize(object.Size)}</td>
                      <td>{object.LastModified.toLocaleString()}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => downloadObject(object.Key)}
                        >
                          <FaDownload className="me-1" /> Download
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {folders.length === 0 && objects.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center">
                        This folder is empty.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Load more button */}
      {continuationToken && (
        <div className="d-flex justify-content-center mt-4">
          <button className="btn btn-primary" onClick={loadMore}>
            Load More
          </button>
        </div>
      )}
    </Layout>
  );
}
