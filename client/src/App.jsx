import React, { useState, useEffect } from 'react';
import API from './services/api';
import { AlertTriangle, Shield, MapPin, Activity, Package, LogOut, CheckCircle } from 'lucide-react';
import EmergencyMap from './components/EmergencyMap.jsx';

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #475569',
  backgroundColor: '#0f172a',
  color: '#fff',
  boxSizing: 'border-box'
};

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
      // Set authorization header globally for all API requests
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchEmergencies();
      fetchNearbyResources();
    }
  }, [token]);

  // Auth Submit Handler (Login / Register)
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email, password }
        : { name, phone, email, password };

      const res = await API.post(endpoint, payload);

      if (res.data && res.data.token) {
        const userToken = res.data.token;
        localStorage.setItem('token', userToken);
        API.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        setToken(userToken);
        setMsg(isLogin ? 'Login successful! 🚀' : 'Registration successful! 🚀');
        fetchEmergencies();
        fetchNearbyResources();
      } else {
        setMsg('Authentication completed, please login.');
      }
    } catch (err) {
      console.error("Auth Error:", err);
      setMsg(err.response?.data?.message || 'Authentication failed! Please check credentials or backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete API.defaults.headers.common['Authorization'];
    setToken('');
    setEmergencies([]);
    setResources([]);
  };

  const fetchEmergencies = async () => {
    try {
      const res = await API.get('/emergencies');
      setEmergencies(res.data.data || []);
    } catch (err) {
      console.error("Fetch Emergencies Error:", err);
    }
  };

  const fetchNearbyResources = async () => {
    try {
      const res = await API.get('/resources/nearby?lng=78.4867&lat=17.385&maxDistance=10000');
      setResources(res.data.data || []);
    } catch (err) {
      console.error("Fetch Resources Error:", err);
    }
  };

  const handleTriggerSOS = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const payload = {
        emergencyType: sosType,
        type: sosType,
        description: sosDesc,
        location: {
          type: 'Point',
          coordinates: [78.4867, 17.385]
        }
      };

      await API.post('/emergencies', payload);
      setSosDesc('');
      setMsg('🚨 SOS Emergency Broadcast Sent Successfully!');
      fetchEmergencies();
    } catch (err) {
      console.error("SOS Trigger Error Details:", err.response?.data || err.message);
      setMsg(err.response?.data?.message || 'Failed to broadcast SOS. Please check login/backend.');
    } finally {
      setLoading(false);
    }
  };

  // 👉 Volunteer Status Update Handler
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await API.patch(`/emergencies/${id}/status`, { status: newStatus });
      setMsg(`✅ Emergency marked as ${newStatus}!`);
      fetchEmergencies();
    } catch (err) {
      console.error("Update Status Error:", err);
      setMsg('Failed to update status');
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

            <button type="submit" disabled={loading} style={{ backgroundColor: '#2563eb', color: '#fff', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '15px', cursor: 'pointer', color: '#60a5fa' }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Register" : "Already registered? Login"}
          </p>
        </div>
      ) : (
        /* Dashboard Screen */
        <div>
          {/* Live Incident Map Section */}
          <div className="my-6" style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', marginTop: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
              <MapPin /> 📍 Live Incident Map
            </h3>
            <EmergencyMap emergencies={emergencies} />
          </div>

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
                <div style={{ maxHeight: '250px', overflowY: 'auto', marginTop: '10px' }}>
                  {emergencies.length === 0 ? <p style={{ color: '#94a3b8' }}>No active emergencies right now.</p> : (
                    emergencies.map((item) => (
                      <div key={item._id} style={{ background: '#0f172a', padding: '12px', borderRadius: '6px', marginBottom: '10px', borderLeft: '3px solid #ef4444' }}>
                        <strong style={{ color: '#ef4444' }}>[{item.emergencyType || item.type}]</strong> {item.description}
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>By: {item.user?.name || 'Unknown'} | Status: <b style={{ color: item.status === 'resolved' ? '#10b981' : '#f59e0b' }}>{item.status}</b></span>
                          {item.status !== 'resolved' && (
                            <button
                              onClick={() => handleUpdateStatus(item._id, 'resolved')}
                              style={{ background: '#10b981', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                            >
                              Mark Resolved
                            </button>
                          )}
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
                        <strong style={{ color: '#10b981' }}>{res.resourceType?.toUpperCase()}</strong>: {res.quantity} {res.unit}
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
        </div>
      )}
    </div>
  );
}

export default App;