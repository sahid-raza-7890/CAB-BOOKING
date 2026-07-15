import React, { useState, useEffect } from 'react';
import { passengerApiService } from '../../../services/passengerApiService';
import '../Passenger.css';

const Receipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReceipts();
  }, [page]);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      // Assuming getReceipts takes pagination params if available in backend, passing it just in case
      // or we can slice manually if it returns all
      const data = await passengerApiService.getReceipts();
      const allReceipts = data.data || data || [];
      
      // Simple client-side pagination if backend doesn't paginate
      const limit = 10;
      const startIndex = (page - 1) * limit;
      const paginatedReceipts = allReceipts.slice(startIndex, startIndex + limit);
      
      setReceipts(paginatedReceipts);
      setTotalPages(Math.ceil(allReceipts.length / limit) || 1);
    } catch (err) {
      setError(err.message || 'Failed to fetch receipts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pp-container" style={{ maxWidth: '700px' }}>
      <h2 className="pp-title">Ride Receipts</h2>
      
      {error && <div className="pp-error">{error}</div>}

      {loading && receipts.length === 0 ? (
        <div style={{ textAlign: 'center' }}>Loading receipts...</div>
      ) : receipts.length === 0 ? (
        <p style={{ color: '#94A3B8', textAlign: 'center' }}>No receipts found.</p>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className="pp-table">
              <thead>
                <tr>
                  <th className="pp-th">Receipt ID</th>
                  <th className="pp-th">Date</th>
                  <th className="pp-th">Driver</th>
                  <th className="pp-th">Amount</th>
                  <th className="pp-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map(receipt => (
                  <tr key={receipt._id || receipt.id}>
                    <td className="pp-td pp-td-bright">{receipt.receiptId || receipt._id || receipt.id}</td>
                    <td className="pp-td">{receipt.date || receipt.createdAt ? new Date(receipt.date || receipt.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td className="pp-td">{receipt.driverName || receipt.driver?.name || 'N/A'}</td>
                    <td className="pp-td" style={{ fontWeight: 'bold', color: '#10B981' }}>${Number(receipt.amount || receipt.fare || 0).toFixed(2)}</td>
                    <td className="pp-td">
                      <span className="pp-badge">
                        {receipt.status || 'Completed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="pp-pagination">
              <button 
                className="pp-pagination-btn"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Prev
              </button>
              <span>Page {page} of {totalPages}</span>
              <button 
                className="pp-pagination-btn"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Receipts;
