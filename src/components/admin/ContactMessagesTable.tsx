import { useState, useEffect } from 'react';
import { db } from '../../firebase/client';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  language: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: any;
  recaptchaScore?: number;
}

export default function ContactMessagesTable() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'replied' | 'archived'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'contactMessages'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData: ContactMessage[] = [];
      snapshot.forEach((doc) => {
        messagesData.push({ id: doc.id, ...doc.data() } as ContactMessage);
      });
      setMessages(messagesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (messageId: string, status: ContactMessage['status']) => {
    try {
      await updateDoc(doc(db, 'contactMessages', messageId), { status });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await deleteDoc(doc(db, 'contactMessages', messageId));
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const filteredMessages = messages.filter((msg) => {
    if (filter === 'all') return true;
    return msg.status === filter;
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      new: { color: '#3B82F6', bg: '#EFF6FF', label: 'New' },
      read: { color: '#F59E0B', bg: '#FEF3C7', label: 'Read' },
      replied: { color: '#10B981', bg: '#D1FAE5', label: 'Replied' },
      archived: { color: '#6B7280', bg: '#F3F4F6', label: 'Archived' },
    };
    const badge = badges[status as keyof typeof badges] || badges.new;
    
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 600,
          color: badge.color,
          background: badge.bg,
        }}
      >
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '16px', color: 'var(--gray-600)' }}>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="messages-container">
      {/* Filters */}
      <div className="filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({messages.length})
        </button>
        <button
          className={`filter-btn ${filter === 'new' ? 'active' : ''}`}
          onClick={() => setFilter('new')}
        >
          New ({messages.filter((m) => m.status === 'new').length})
        </button>
        <button
          className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
          onClick={() => setFilter('read')}
        >
          Read ({messages.filter((m) => m.status === 'read').length})
        </button>
        <button
          className={`filter-btn ${filter === 'replied' ? 'active' : ''}`}
          onClick={() => setFilter('replied')}
        >
          Replied ({messages.filter((m) => m.status === 'replied').length})
        </button>
        <button
          className={`filter-btn ${filter === 'archived' ? 'active' : ''}`}
          onClick={() => setFilter('archived')}
        >
          Archived ({messages.filter((m) => m.status === 'archived').length})
        </button>
      </div>

      {/* Messages Table */}
      <div className="table-container">
        {filteredMessages.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <h3>No messages found</h3>
            <p>There are no contact messages in this category.</p>
          </div>
        ) : (
          <table className="messages-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Status</th>
                <th>Language</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.map((message) => (
                <tr key={message.id} onClick={() => setSelectedMessage(message)}>
                  <td>{formatDate(message.createdAt)}</td>
                  <td>
                    <strong>{message.name}</strong>
                    {message.status === 'new' && (
                      <span className="new-indicator"></span>
                    )}
                  </td>
                  <td>{message.email}</td>
                  <td>{message.company || '-'}</td>
                  <td>{getStatusBadge(message.status)}</td>
                  <td>{message.language.toUpperCase()}</td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMessage(message);
                        if (message.status === 'new') {
                          updateStatus(message.id, 'read');
                        }
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="modal-overlay" onClick={() => setSelectedMessage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Message Details</h2>
              <button className="btn-close" onClick={() => setSelectedMessage(null)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Name</label>
                  <p>{selectedMessage.name}</p>
                </div>
                <div className="detail-item">
                  <label>Email</label>
                  <p>
                    <a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a>
                  </p>
                </div>
                <div className="detail-item">
                  <label>Phone</label>
                  <p>{selectedMessage.phone || 'Not provided'}</p>
                </div>
                <div className="detail-item">
                  <label>Company</label>
                  <p>{selectedMessage.company || 'Not provided'}</p>
                </div>
                <div className="detail-item">
                  <label>Language</label>
                  <p>{selectedMessage.language === 'en' ? 'English' : 'Spanish'}</p>
                </div>
                <div className="detail-item">
                  <label>Date</label>
                  <p>{formatDate(selectedMessage.createdAt)}</p>
                </div>
                {selectedMessage.recaptchaScore !== undefined && (
                  <div className="detail-item">
                    <label>Security Score</label>
                    <p>{(selectedMessage.recaptchaScore * 100).toFixed(0)}%</p>
                  </div>
                )}
              </div>

              <div className="message-content">
                <label>Message</label>
                <div className="message-text">{selectedMessage.message}</div>
              </div>

              <div className="status-actions">
                <label>Update Status</label>
                <div className="status-buttons">
                  <button
                    className={`status-btn ${selectedMessage.status === 'read' ? 'active' : ''}`}
                    onClick={() => updateStatus(selectedMessage.id, 'read')}
                  >
                    Mark as Read
                  </button>
                  <button
                    className={`status-btn ${selectedMessage.status === 'replied' ? 'active' : ''}`}
                    onClick={() => updateStatus(selectedMessage.id, 'replied')}
                  >
                    Mark as Replied
                  </button>
                  <button
                    className={`status-btn ${selectedMessage.status === 'archived' ? 'active' : ''}`}
                    onClick={() => updateStatus(selectedMessage.id, 'archived')}
                  >
                    Archive
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-delete" onClick={() => deleteMessage(selectedMessage.id)}>
                Delete Message
              </button>
              <button className="btn-secondary" onClick={() => setSelectedMessage(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .messages-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .filters {
          display: flex;
          gap: 8px;
          padding: 20px;
          border-bottom: 1px solid var(--gray-200);
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 8px 16px;
          border: 1px solid var(--gray-300);
          background: white;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: var(--gray-700);
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-btn:hover {
          background: var(--gray-50);
        }

        .filter-btn.active {
          background: var(--green);
          color: white;
          border-color: var(--green);
        }

        .table-container {
          overflow-x: auto;
        }

        .messages-table {
          width: 100%;
          border-collapse: collapse;
        }

        .messages-table thead {
          background: var(--gray-50);
        }

        .messages-table th {
          padding: 12px 16px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: var(--gray-600);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .messages-table td {
          padding: 16px;
          border-top: 1px solid var(--gray-200);
          font-size: 14px;
          color: var(--gray-700);
        }

        .messages-table tbody tr {
          cursor: pointer;
          transition: background 0.2s;
        }

        .messages-table tbody tr:hover {
          background: var(--gray-50);
        }

        .new-indicator {
          display: inline-block;
          width: 8px;
          height: 8px;
          background: #3B82F6;
          border-radius: 50%;
          margin-left: 8px;
        }

        .btn-view {
          padding: 6px 12px;
          background: var(--green);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-view:hover {
          background: var(--green-dark);
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-state svg {
          color: var(--gray-400);
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--gray-700);
          margin-bottom: 8px;
        }

        .empty-state p {
          color: var(--gray-500);
          font-size: 14px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid var(--gray-200);
        }

        .modal-header h2 {
          font-size: 20px;
          font-weight: 700;
          color: var(--gray-900);
          margin: 0;
        }

        .btn-close {
          width: 32px;
          height: 32px;
          border: none;
          background: var(--gray-100);
          border-radius: 8px;
          font-size: 24px;
          color: var(--gray-600);
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-close:hover {
          background: var(--gray-200);
        }

        .modal-body {
          padding: 24px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        .detail-item label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: var(--gray-600);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .detail-item p {
          font-size: 14px;
          color: var(--gray-900);
          margin: 0;
        }

        .detail-item a {
          color: var(--green);
          text-decoration: none;
        }

        .detail-item a:hover {
          text-decoration: underline;
        }

        .message-content {
          margin-bottom: 24px;
        }

        .message-content label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: var(--gray-600);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .message-text {
          background: var(--gray-50);
          padding: 16px;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.6;
          color: var(--gray-800);
          white-space: pre-wrap;
        }

        .status-actions label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: var(--gray-600);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
        }

        .status-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .status-btn {
          padding: 8px 16px;
          border: 1px solid var(--gray-300);
          background: white;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: var(--gray-700);
          cursor: pointer;
          transition: all 0.2s;
        }

        .status-btn:hover {
          background: var(--gray-50);
        }

        .status-btn.active {
          background: var(--green);
          color: white;
          border-color: var(--green);
        }

        .modal-footer {
          display: flex;
          justify-content: space-between;
          padding: 20px 24px;
          border-top: 1px solid var(--gray-200);
        }

        .btn-delete {
          padding: 10px 20px;
          background: #DC2626;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-delete:hover {
          background: #B91C1C;
        }

        .btn-secondary {
          padding: 10px 20px;
          background: var(--gray-100);
          color: var(--gray-700);
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: var(--gray-200);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--gray-200);
          border-top-color: var(--green);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .detail-grid {
            grid-template-columns: 1fr;
          }

          .modal-footer {
            flex-direction: column;
            gap: 12px;
          }

          .btn-delete,
          .btn-secondary {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
