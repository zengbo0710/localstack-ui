import Head from 'next/head';
import React, { ReactNode } from 'react';
import Link from 'next/link';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout = ({ children, title = 'LocalStack S3 Browser' }: LayoutProps) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Browse S3 buckets in LocalStack" />
        <link rel="icon" href="/favicon.ico" />
        <link 
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" 
          rel="stylesheet"
        />
      </Head>

      <div className="header bg-dark text-white py-3 mb-4">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <Link href="/" className="text-white text-decoration-none">
              <h1 className="h3 mb-0">LocalStack S3 Browser</h1>
            </Link>
          </div>
        </div>
      </div>

      <main className="container pb-5">
        {children}
      </main>

      <footer className="footer mt-auto py-3 bg-light">
        <div className="container text-center">
          <span className="text-muted">LocalStack S3 Browser &copy; {new Date().getFullYear()}</span>
        </div>
      </footer>

      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    </>
  );
};

export default Layout;