import React from 'react';

const SimpleTest = () => {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold">Simple Test Page</h1>
      <p className="mt-4">This is a simple test page to verify routing.</p>
      <p className="mt-2">If you can see this, routing is working correctly.</p>
      <div className="mt-6">
        <a href="/test-geography" className="text-blue-500 hover:underline">
          Go to Test Geography Page
        </a>
      </div>
    </div>
  );
};

export default SimpleTest; 