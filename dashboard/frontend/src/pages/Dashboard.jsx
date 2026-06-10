import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user, setAuthUser }) => {
  const [labs, setLabs] = useState([]);
  const [flags, setFlags] = useState({});
  const [messages, setMessages] = useState({});
  const [activeTiers, setActiveTiers] = useState({}); // Stores selected tier per category: { A01: 'Easy' }
  const [expandedLab, setExpandedLab] = useState(null); // Stores lab ID for which hints are expanded
  const [labDetails, setLabDetails] = useState({}); // Stores hint/walkthrough content
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
        
        // Initialize default active tiers for categories
        const initialTiers = {};
        data.forEach(lab => {
          if (!initialTiers[lab.category]) {
            initialTiers[lab.category] = 'Easy';
          }
        });
        setActiveTiers(prev => ({ ...initialTiers, ...prev }));
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
        fetchLabs(); // refresh progress
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

  // Group labs by category
  const categories = {};
  labs.forEach(lab => {
    const cat = lab.category;
    if (!categories[cat]) {
      categories[cat] = {
        code: cat,
        name: getCategoryName(cat, lab.title),
        labs: { Easy: null, Medium: null, Hard: null }
      };
    }
    categories[cat].labs[lab.tier] = lab;
  });

  function getCategoryName(code, title) {
    const names = {
      'A01': 'Broken Access Control',
      'A02': 'Security Misconfiguration',
      'A03': 'Software & Data Integrity Failures',
      'A04': 'Cryptographic Failures',
      'A05': 'Injection',
      'A06': 'Insecure Design',
      'A07': 'Authentication Failures',
      'A08': 'Software & Data Integrity Failures',
      'A09': 'Security Logging & Alerting Failures',
      'A10': 'Mishandling of Exceptional Conditions'
    };
    return names[code] || title;
  }

  const completedCount = labs.filter(l => l.completed).length;
  const totalSeeded = labs.length;

  return (
    <div className="dashboard-container">
      <div className="header">
        <div>
          <h1 className="header-title">OWASPLab</h1>
          <div className="header-meta">
            Logged in as <strong>{user?.username}</strong> ({user?.role})
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="stats-bar">
        <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>
          Overall Progress: {completedCount} / {totalSeeded} Labs Completed
          <div className="progress-track">
            <div 
              className="progress-fill" 
              style={{ width: `${totalSeeded ? (completedCount / totalSeeded) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Role Level: <span style={{ color: 'var(--indigo-500)', fontWeight: 700 }}>{user?.role}</span>
        </div>
      </div>

      <div className="categories-grid">
        {Object.values(categories).map(category => {
          const activeTier = activeTiers[category.code] || 'Easy';
          const selectedLab = category.labs[activeTier];

          return (
            <div key={category.code} className="category-card">
              <span className="category-code">{category.code}</span>
              <h2 className="category-title">{category.name}</h2>

              {/* Difficulty Tabs */}
              <div className="tier-tabs">
                {['Easy', 'Medium', 'Hard'].map(tierName => {
                  const labForTier = category.labs[tierName];
                  const isActive = activeTier === tierName;
                  const isCompleted = labForTier?.completed;
                  const exists = !!labForTier;

                  let tabClass = 'tier-tab';
                  if (isActive) tabClass += ' active';
                  if (isCompleted) tabClass += ' completed';

                  return (
                    <button
                      key={tierName}
                      className={tabClass}
                      onClick={() => {
                        setActiveTiers({ ...activeTiers, [category.code]: tierName });
                        // Close hints when changing tabs
                        setExpandedLab(null);
                      }}
                    >
                      {isCompleted ? '✓ ' : ''}
                      {!exists ? '🔒 ' : ''}
                      {tierName}
                    </button>
                  );
                })}
              </div>

              {/* Selected Lab Details */}
              {selectedLab ? (
                <div className="tier-details">
                  <p className="tier-desc">{selectedLab.description}</p>
                  
                  <div className="lab-actions">
                    <a 
                      href={`/labs/${selectedLab.id}/`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-launch"
                    >
                      Launch Lab
                    </a>
                    
                    {(user?.role === 'Trainer' || user?.role === 'Admin') && (
                      <button 
                        onClick={() => toggleDetails(selectedLab.id)} 
                        className="btn-hints"
                      >
                        {expandedLab === selectedLab.id ? 'Hide Solution' : 'View Solution'}
                      </button>
                    )}
                  </div>

                  {/* Flag Submission */}
                  <div className="flag-form">
                    <input 
                      type="text" 
                      className="flag-input-box" 
                      placeholder={selectedLab.completed ? "Lab completed!" : "FLAG{...}"}
                      value={flags[selectedLab.id] || ''}
                      onChange={e => setFlags({ ...flags, [selectedLab.id]: e.target.value })}
                      disabled={selectedLab.completed}
                    />
                    <button 
                      className="btn-submit-flag" 
                      onClick={() => submitFlag(selectedLab.id)}
                      disabled={selectedLab.completed}
                    >
                      Submit
                    </button>
                  </div>
                  
                  {messages[selectedLab.id] && (
                    <div style={{ 
                      marginTop: '10px', 
                      fontSize: '0.85rem', 
                      fontWeight: 600,
                      color: messages[selectedLab.id].success ? 'var(--emerald-500)' : 'var(--rose-500)' 
                    }}>
                      {messages[selectedLab.id].text}
                    </div>
                  )}

                  {/* Hints Panel (Trainer / Admin Only) */}
                  {expandedLab === selectedLab.id && labDetails[selectedLab.id] && (
                    <div className="hints-container">
                      <div className="hints-header">Solution Resources</div>
                      {labDetails[selectedLab.id].hint1 && (
                        <div className="hint-item"><strong>Hint 1:</strong> {labDetails[selectedLab.id].hint1}</div>
                      )}
                      {labDetails[selectedLab.id].hint2 && (
                        <div className="hint-item"><strong>Hint 2:</strong> {labDetails[selectedLab.id].hint2}</div>
                      )}
                      {labDetails[selectedLab.id].hint3 && (
                        <div className="hint-item"><strong>Hint 3:</strong> {labDetails[selectedLab.id].hint3}</div>
                      )}
                      {labDetails[selectedLab.id].walkthrough && (
                        <div className="walkthrough-item">
                          <strong>Walkthrough:</strong><br/>
                          <span style={{ whiteSpace: 'pre-line' }}>{labDetails[selectedLab.id].walkthrough}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="tier-details" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: '120px' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    🔒 Difficulty not yet available.
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
