import React, { useState, useEffect } from 'react';
import API from './services/api';
import { AlertTriangle, Shield, MapPin, Activity, Package, LogOut, CheckCircle } from 'lucide-react';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isLogin, setIsLogin] = useState(true);
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Dashboard Data State
  const [emergencies, setEmergencies] = useState([]);
  const [resources, setResources] = useState([]);
  const [sosType, setSosType] = useState('Medical');
  const [sosDesc, setSosDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Auto fetch data on load if token exists
  useEffect(() => {
    if (token) {
      fetchEmergencies();
      fetchNearbyResources();
    }
  }, [token]);

const handleBroadcastSOS = async (e) => {
  if (e) e.preventDefault();
  
  try {
    // 1. Storage nundi login token teeshukuntam
    const token = localStorage.getItem('token');

    // 2. Fallback Location & Form Details payload
    const sosPayload = {
      emergencyType: emergencyType || 'Food & Water Supply',
      description: description,
      location: {
        type: 'Point',
        coordinates: [78.4867, 17.3850] // Default [Longitude, Latitude]
      }
    };

    // 3. Backend API Call with Token
    const res = await axios.post('http://localhost:5000/api/requests', sosPayload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (res.data.success || res.status === 201 || res.status === 200) {
      alert("SOS Broadcasted Successfully! 🚨");
      // Form reset or state update logic ikkada untundhi
    }
  } catch (error) {
    console.error("SOS Broadcast Error:", error);
    alert("Failed to broadcast SOS");
  }
};

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
  };

  const fetchEmergencies = async () => {
    try {
      const res = await API.get('/emergencies');
      setEmergencies(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNearbyResources = async () => {
    try {
      // Fetching nearby using Charminar coords [78.4867, 17.385]
      const res = await API.get('/resources/nearby?lng=78.4867&lat=17.385&maxDistance=10000');
      setResources(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerSOS = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/emergencies', {
        emergencyType: sosType,
        description: sosDesc,
        location: { type: 'Point', coordinates: [78.4867, 17.385] }
      });
      setSosDesc('');
      setMsg('🚨 SOS Emergency Broadcast Sent!');
      fetchEmergencies();
    } catch (err) {
      setMsg('Failed to broadcast SOS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '20px' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '15px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', margin: 0 }}>
          <Shield size={36} /> ResQNet Platform
        </h1>
        {token && (
          <button onClick={logout} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <LogOut size={16} /> Logout
          </button>
        )}
      </header>

      {msg && <div style={{ background: '#1e293b', borderLeft: '4px solid #3b82f6', padding: '10px', margin: '15px 0', borderRadius: '4px' }}>{msg}</div>}

      {/* Auth Screen if not logged in */}
      {!token ? (
        <div style={{ maxWidth: '400px', margin: '50px auto', background: '#1e293b', padding: '30px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h2>{isLogin ? 'Login to ResQNet' : 'Register Volunteer/User'}</h2>
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {!isLogin && (
              <>
                <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required style={inputStyle} />
                <input type="text" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} required style={inputStyle} />
              </>
            )}
            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
            
            <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              {isLogin ? 'Login' : 'Register'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '15px', cursor: 'pointer', color: '#60a5fa' }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Register" : "Already registered? Login"}
          </p>
        </div>
      ) : (
        /* Dashboard Screen */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
          {/* Left Column: SOS Broadcast */}
          <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #ef4444' }}>
            <h2 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle /> Trigger SOS Alert
            </h2>
            <form onSubmit={handleTriggerSOS} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Emergency Type:</label>
                <select value={sosType} onChange={e => setSosType(e.target.value)} style={inputStyle}>
                  <option value="Medical">Medical Emergency</option>
                  <option value="Fire">Fire Rescue</option>
                  <option value="Flood">Flood/Disaster</option>
                  <option value="Food/Water">Food & Water Supply</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Description:</label>
                <textarea value={sosDesc} onChange={e => setSosDesc(e.target.value)} placeholder="Describe immediate help needed..." required style={{ ...inputStyle, minHeight: '80px' }} />
              </div>
              <button type="submit" disabled={loading} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                {loading ? 'Sending SOS...' : '🚨 BROADCAST SOS NOW'}
              </button>
            </form>
          </div>

          {/* Right Column: Active Emergencies & Nearby Resources */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Active Emergencies */}
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
                <Activity /> Active Emergency Feeds ({emergencies.length})
              </h3>
              <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '10px' }}>
                {emergencies.length === 0 ? <p style={{ color: '#94a3b8' }}>No active emergencies right now.</p> : (
                  emergencies.map((item) => (
                    <div key={item._id} style={{ background: '#0f172a', padding: '10px', borderRadius: '6px', marginBottom: '10px', borderLeft: '3px solid #ef4444' }}>
                      <strong style={{ color: '#ef4444' }}>[{item.emergencyType}]</strong> {item.description}
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                        By: {item.user?.name || 'Unknown'} | Status: {item.status}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Nearby Resources */}
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
                <Package /> Nearby Available Resources ({resources.length})
              </h3>
              <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '10px' }}>
                {resources.length === 0 ? <p style={{ color: '#94a3b8' }}>No nearby resources found within 10km.</p> : (
                  resources.map((res) => (
                    <div key={res._id} style={{ background: '#0f172a', padding: '10px', borderRadius: '6px', marginBottom: '10px', borderLeft: '3px solid #10b981' }}>
                      <strong style={{ color: '#10b981' }}>{res.resourceType.toUpperCase()}</strong>: {res.quantity} {res.unit}
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                        Owner: {res.owner?.name || 'Volunteer'} ({res.owner?.phone || 'N/A'})
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #475569',
  backgroundColor: '#0f172a',
  color: '#fff',
  boxSizing: 'border-box'
};

export default App;
