import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { FaArchive, FaPlus } from 'react-icons/fa';

interface Bucket {
  Name: string;
  CreationDate: Date;
}

export default function Home() {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newBucketName, setNewBucketName] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Fetch buckets on load
  useEffect(() => {
    fetchBuckets();
  }, []);

  // Function to fetch buckets
  const fetchBuckets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/buckets');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Format the dates
      const formattedBuckets = data.map((bucket: any) => ({
        ...bucket,
        CreationDate: new Date(bucket.CreationDate)
      }));
      
      setBuckets(formattedBuckets);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching buckets:', err);
      setError('Failed to load buckets. Please check if LocalStack is running.');
    } finally {
      setLoading(false);
    }
  };

  // Function to create a new bucket
  const createBucket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newBucketName.trim()) {
      setError('Bucket name cannot be empty');
      return;
    }
    
    try {
      const response = await fetch('/api/buckets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bucketName: newBucketName }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create bucket');
      }
      
      // Reset form and fetch updated bucket list
      setNewBucketName('');
      setShowModal(false);
      fetchBuckets();
    } catch (err: any) {
      console.error('Error creating bucket:', err);
      setError(err.message);
    }
  };

  return (
    <Layout title="S3 Buckets - LocalStack Browser">
      <div className="row mb-4">
        <div className="col-md-6">
          <h2>S3 Buckets</h2>
        </div>
        <div className="col-md-6 text-end">
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <FaPlus className="me-2" /> Create Bucket
          </button>
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
      ) : buckets.length > 0 ? (
        <div className="row">
          {buckets.map((bucket) => (
            <div className="col-md-4 mb-4" key={bucket.Name}>
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">
                    <FaArchive className="me-2 text-warning" />
                    {bucket.Name}
                  </h5>
                  <p className="card-text">
                    Created: {bucket.CreationDate.toLocaleString()}
                  </p>
                </div>
                <div className="card-footer">
                  <Link
                    href={`/bucket/${encodeURIComponent(bucket.Name)}`}
                    className="btn btn-primary"
                  >
                    Browse
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info">
          No buckets found. Create a new bucket to get started.
        </div>
      )}

      {/* Create Bucket Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Bucket</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={createBucket}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="bucketName" className="form-label">
                      Bucket Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="bucketName"
                      value={newBucketName}
                      onChange={(e) => setNewBucketName(e.target.value)}
                      required
                    />
                    <div className="form-text">
                      Bucket names must be globally unique and follow AWS naming rules.
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}
    </Layout>
  );
}