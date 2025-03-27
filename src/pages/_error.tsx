import { NextPageContext } from 'next';

interface ErrorProps {
  statusCode?: number;
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div className="container mt-5 text-center">
      <h1 className="text-danger">Error</h1>
      <p>
        {statusCode
          ? `An error ${statusCode} occurred on server`
          : 'An error occurred on client'}
      </p>
      <button 
        className="btn btn-primary mt-3" 
        onClick={() => window.location.href = '/'}
      >
        Go back to homepage
      </button>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
