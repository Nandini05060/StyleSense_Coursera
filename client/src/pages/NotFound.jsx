import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
      <span className="editorial-subheading text-burgundy">404 • Page Not Found</span>
      <h1 className="editorial-heading text-4xl sm:text-5xl">
        This Look Does Not Exist
      </h1>
      <p className="text-sm font-sans text-taupe leading-relaxed">
        The page you requested may have been relocated, archived, or is temporarily unavailable in the current catalog collection.
      </p>
      <div className="pt-2 flex justify-center gap-4">
        <Link to="/">
          <Button variant="primary">Return Home</Button>
        </Link>
        <Link to="/shop">
          <Button variant="outline">Browse Catalog</Button>
        </Link>
      </div>
    </div>
  );
}
