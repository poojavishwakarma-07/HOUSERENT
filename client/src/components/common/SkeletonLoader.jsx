import React from 'react';

const SkeletonLoader = ({ count = 4 }) => {
  return (
    <div className="row g-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="col-12 col-md-6 col-lg-3">
          <div className="card border-0 glass-card" style={{ height: '380px' }}>
            {/* Image Placeholder */}
            <div className="skeleton" style={{ height: '200px', width: '100%' }}></div>
            {/* Content Placeholder */}
            <div className="card-body d-flex flex-column gap-2 p-3">
              <div className="skeleton" style={{ height: '24px', width: '75%', borderRadius: '4px' }}></div>
              <div className="skeleton" style={{ height: '16px', width: '50%', borderRadius: '4px' }}></div>
              <hr className="my-2" style={{ opacity: 0.1 }} />
              <div className="d-flex justify-content-between mt-auto">
                <div className="skeleton" style={{ height: '20px', width: '35%', borderRadius: '4px' }}></div>
                <div className="skeleton" style={{ height: '20px', width: '45%', borderRadius: '4px' }}></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
