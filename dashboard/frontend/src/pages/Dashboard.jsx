import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user, setAuthUser }) => {
  const [labs, setLabs] = useState([]);
  const [flags, setFlags] = useState({});
  const [messages, setMessages] = useState({});
  const [expandedLab, setExpandedLab] = useState(null);
  const [labDetails, setLabDetails] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchLabs();
  }, [user, navigate]);

  const fetchLabs = async () => {
    try {
      const response = await fetch('/api/labs');
      if (response.ok) {
        const data = await response.json();
        setLabs(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setAuthUser(null);
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const submitFlag = async (labId) => {
    const flag = flags[labId];
    if (!flag) return;

    try {
      const response = await fetch(`/api/labs/${labId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flag }),
      });
      const data = await response.json();
      
      setMessages({ ...messages, [labId]: { text: data.message, success: data.success } });
      
      if (data.success) {
        fetchLabs(); // refresh completion status
      }
    } catch (err) {
      setMessages({ ...messages, [labId]: { text: 'Network error', success: false } });
    }
  };

  const toggleDetails = async (labId) => {
    if (expandedLab === labId) {
      setExpandedLab(null);
      return;
    }

    setExpandedLab(labId);
    
    if (user.role !== 'Student' && !labDetails[labId]) {
      try {
        const response = await fetch(`/api/labs/${labId}`);
        if (response.ok) {
          const data = await response.json();
          setLabDetails({ ...labDetails, [labId]: data.content });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const completedCount = labs.filter(l => l.completed).length;

  return (
    <div className="dashboard-container">
      <div className="header">
        <div>
          <h2 style={{ margin: 0 }}>OWASPLab Dashboard</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '5px' }}>
            Logged in as <strong>{user?.username}</strong> ({user?.role})
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div>Progress: {completedCount} / {labs.length || 30} Labs</div>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="labs-grid">
        {labs.map(lab => (
          <div key={lab.id} className="glass-card lab-card">
            <div className="lab-meta">
              <span className={`tier-badge ${lab.tier.toLowerCase()}`}>{lab.tier}</span>
              <span className={`status-badge ${lab.completed ? 'completed' : 'pending'}`}>
                {lab.completed ? '✅ Completed' : '🔒 Pending'}
              </span>
            </div>
            
            <div className="lab-category">{lab.category}</div>
            <h3 className="lab-title">{lab.title}</h3>
            
            <p className="lab-description">{lab.description}</p>
            
            <div className="lab-actions">
              <a href={`/labs/${lab.id}/`} target="_blank" rel="noopener noreferrer" className="btn-launch">Launch Lab</a>
              {(user?.role === 'Trainer' || user?.role === 'Admin') && (
                <button 
                  onClick={() => toggleDetails(lab.id)} 
                  style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  {expandedLab === lab.id ? 'Hide Hints' : 'View Hints'}
                </button>
              )}
            </div>

            <div className="flag-submission">
              <input 
                type="text" 
                className="flag-input" 
                placeholder="FLAG{...}" 
                value={flags[lab.id] || ''}
                onChange={e => setFlags({ ...flags, [lab.id]: e.target.value })}
                disabled={lab.completed}
              />
              <button 
                className="btn-submit" 
                onClick={() => submitFlag(lab.id)}
                disabled={lab.completed}
              >
                Submit
              </button>
            </div>
            
            {messages[lab.id] && (
              <div style={{ 
                marginTop: '10px', 
                fontSize: '0.85rem', 
                color: messages[lab.id].success ? '#2ecc71' : '#e74c3c' 
              }}>
                {messages[lab.id].text}
              </div>
            )}

            {expandedLab === lab.id && labDetails[lab.id] && (
              <div className="hints-panel">
                <h4 style={{ margin: '0 0 10px 0', color: 'var(--red-500)' }}>Trainer/Admin Hints</h4>
                <div className="hint"><strong>Hint 1:</strong> {labDetails[lab.id].hint1}</div>
                <div className="hint"><strong>Hint 2:</strong> {labDetails[lab.id].hint2}</div>
                <div className="hint"><strong>Hint 3:</strong> {labDetails[lab.id].hint3}</div>
                <div className="hint" style={{ marginTop: '10px' }}>
                  <strong>Walkthrough:</strong><br/>
                  {labDetails[lab.id].walkthrough}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
