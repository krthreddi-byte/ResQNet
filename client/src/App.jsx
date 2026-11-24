
import React, { useState, useEffect } from 'react';
import API from './services/api';
import {
  AlertTriangle,
  Shield,
  MapPin,
  Activity,
  Package,
  LogOut
} from 'lucide-react';
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
  const [token, setToken] = useState(
    localStorage.getItem('token') || ''
  );
  const [isLogin, setIsLogin] = useState(true);

  // Authentication state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Dashboard state
  const [emergencies, setEmergencies] = useState([]);
  const [resources, setResources] = useState([]);
  const [sosType, setSosType] = useState('Medical');
  const [sosDesc, setSosDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Fetch data after login
  useEffect(() => {
    if (token) {
      API.defaults.headers.common['Authorization'] =
        `Bearer ${token}`;

      fetchEmergencies();
      fetchNearbyResources();
    }
  }, [token]);

  // Login and registration
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const endpoint = isLogin
        ? '/auth/login'
        : '/auth/register';

      const payload = isLogin
        ? { email, password }
        : { name, phone, email, password };

      const res = await API.post(endpoint, payload);

      if (res.data?.token) {
        const userToken = res.data.token;

        localStorage.setItem('token', userToken);

        API.defaults.headers.common['Authorization'] =
          `Bearer ${userToken}`;

        setToken(userToken);
        setMsg(isLogin
          ? 'Login successful!'
          : 'Registration successful!'
        );
      } else {
        setMsg(
          'Registration completed. Please login.'
        );
      }
    } catch (err) {
      console.error('Authentication error:', err);

      setMsg(
        err.response?.data?.message ||
        'Authentication failed. Please check your details.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    delete API.defaults.headers.common['Authorization'];

    setToken('');
    setEmergencies([]);
    setResources([]);
    setMsg('');
  };

  // Get emergencies
  const fetchEmergencies = async () => {
    try {
      const res = await API.get('/emergencies');

      setEmergencies(
        Array.isArray(res.data.data)
          ? res.data.data
          : []
      );
    } catch (err) {
      console.error('Fetch emergencies error:', err);
    }
  };

  // Get resources from MongoDB through the backend
  const fetchNearbyResources = async () => {
    try {
      // The current backend controller exposes GET /resources.
      const res = await API.get('/resources');

      // Support either a raw array response or { data: [...] }.
      const resourceList = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      // Demo reference point: Hyderabad. This is not the device's live GPS.
      const referenceLng = 78.4867;
      const referenceLat = 17.385;
      const maxDistanceKm = 10;

      const distanceInKm = (lng1, lat1, lng2, lat2) => {
        const toRadians = (degrees) => (degrees * Math.PI) / 180;
        const earthRadiusKm = 6371;
        const dLat = toRadians(lat2 - lat1);
        const dLng = toRadians(lng2 - lng1);
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLng / 2) ** 2;

        return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
      };

      const nearbyResources = resourceList.filter((resource) => {
        const coordinates = resource.location?.coordinates;

        if (
          resource.location?.type !== 'Point' ||
          !Array.isArray(coordinates) ||
          coordinates.length !== 2
        ) {
          return false;
        }

        const [lng, lat] = coordinates;
        if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
          return false;
        }

        return (
          distanceInKm(referenceLng, referenceLat, lng, lat) <=
          maxDistanceKm
        );
      });

      setResources(nearbyResources);
    } catch (err) {
      console.error(
        'Fetch resources error:',
        err.response?.data || err.message
      );
      setResources([]);
    }
  };

  // Create an emergency
  const handleTriggerSOS = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const payload = {
        title: `${sosType} Emergency`,
        type: sosType,
        description: sosDesc.trim(),
        location: {
          type: 'Point',
          coordinates: [78.4867, 17.385]
        }
      };

      await API.post('/emergencies', payload);

      setSosDesc('');
      setMsg('SOS emergency broadcast sent successfully!');

      await fetchEmergencies();
    } catch (err) {
      console.error(
        'SOS error:',
        err.response?.data || err.message
      );

      setMsg(
        err.response?.data?.message ||
        'Failed to send SOS. Please check the backend.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Update emergency status
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await API.patch(
        `/emergencies/${id}/status`,
        { status: newStatus }
      );

      setMsg(`Emergency marked as ${newStatus}!`);
      await fetchEmergencies();
    } catch (err) {
      console.error('Update status error:', err);

      setMsg(
        err.response?.data?.message ||
        'Failed to update emergency status.'
      );
    }
  };

  return (
    <div
      style={{
        fontFamily: 'sans-serif',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        minHeight: '100vh',
        padding: '20px'
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #334155',
          paddingBottom: '15px',
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        <h1
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#ef4444',
            margin: 0
          }}
        >
          <Shield size={36} />
          ResQNet Platform
        </h1>

        {token && (
          <button
            onClick={logout}
            style={{
              backgroundColor: '#dc2626',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        )}
      </header>

      {msg && (
        <div
          role="status"
          style={{
            background: '#1e293b',
            borderLeft: '4px solid #3b82f6',
            padding: '10px',
            margin: '15px 0',
            borderRadius: '4px',
            overflowWrap: 'anywhere'
          }}
        >
          {msg}
        </div>
      )}

      {/* Login / Registration */}
      {!token ? (
        <div
          style={{
            maxWidth: '400px',
            margin: '50px auto',
            background: '#1e293b',
            padding: '30px',
            borderRadius: '12px',
            border: '1px solid #334155'
          }}
        >
          <h2>
            {isLogin
              ? 'Login to ResQNet'
              : 'Register Volunteer/User'}
          </h2>

          <form
            onSubmit={handleAuth}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}
          >
            {!isLogin && (
              <>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={inputStyle}
                />

                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  style={inputStyle}
                />
              </>
            )}

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#2563eb',
                color: '#fff',
                padding: '12px',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {loading
                ? 'Please wait...'
                : isLogin
                  ? 'Login'
                  : 'Register'}
            </button>
          </form>

          <p
            style={{
              textAlign: 'center',
              marginTop: '15px',
              cursor: 'pointer',
              color: '#60a5fa'
            }}
            onClick={() => {
              setIsLogin(!isLogin);
              setMsg('');
            }}
          >
            {isLogin
              ? "Don't have an account? Register"
              : 'Already registered? Login'}
          </p>
        </div>
      ) : (
        /* Dashboard */
        <div>
          {/* Emergency Map */}
          <div
            style={{
              background: '#1e293b',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #334155',
              marginTop: '20px'
            }}
          >
            <h3
              style={{
                margin: '0 0 10px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#38bdf8'
              }}
            >
              <MapPin />
              Live Incident Map
            </h3>

            <EmergencyMap emergencies={emergencies} />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: '20px',
              marginTop: '20px'
            }}
          >
            {/* SOS Form */}
            <div
              style={{
                background: '#1e293b',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #ef4444'
              }}
            >
              <h2
                style={{
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertTriangle />
                Trigger SOS Alert
              </h2>

              <form
                onSubmit={handleTriggerSOS}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px'
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '5px'
                    }}
                  >
                    Emergency Type:
                  </label>

                  <select
                    value={sosType}
                    onChange={(e) => setSosType(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="Medical">Medical Emergency</option>
                    <option value="Fire">Fire Rescue</option>
                    <option value="Flood">Flood/Disaster</option>
                    <option value="Food/Water">
                      Food & Water Supply
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '5px'
                    }}
                  >
                    Description:
                  </label>

                  <textarea
                    value={sosDesc}
                    onChange={(e) => setSosDesc(e.target.value)}
                    placeholder="Describe immediate help needed..."
                    required
                    style={{
                      ...inputStyle,
                      minHeight: '80px'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}
                >
                  {loading
                    ? 'Sending SOS...'
                    : 'BROADCAST SOS NOW'}
                </button>
              </form>
            </div>

            {/* Emergencies and Resources */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >
              {/* Emergency Feed */}
              <div
                style={{
                  background: '#1e293b',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #334155'
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#f59e0b'
                  }}
                >
                  <Activity />
                  Active Emergency Feeds ({emergencies.length})
                </h3>

                <div
                  style={{
                    maxHeight: '250px',
                    overflowY: 'auto',
                    marginTop: '10px'
                  }}
                >
                  {emergencies.length === 0 ? (
                    <p style={{ color: '#94a3b8' }}>
                      No emergencies found.
                    </p>
                  ) : (
                    emergencies.map((item) => (
                      <div
                        key={item._id}
                        style={{
                          background: '#0f172a',
                          padding: '12px',
                          borderRadius: '6px',
                          marginBottom: '10px',
                          borderLeft: '3px solid #ef4444'
                        }}
                      >
                        <strong style={{ color: '#ef4444' }}>
                          [{item.type || item.emergencyType || 'Emergency'}]
                        </strong>

                        <div style={{ marginTop: '4px' }}>
                          {item.title}
                        </div>

                        <p style={{ color: '#cbd5e1' }}>
                          {item.description}
                        </p>

                        <div
                          style={{
                            fontSize: '12px',
                            color: '#94a3b8',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '8px',
                            flexWrap: 'wrap'
                          }}
                        >
                          <span>
                            Status: <b>{item.status || 'Pending'}</b>
                          </span>

                          {item.status !== 'Resolved' && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(
                                  item._id,
                                  'Resolved'
                                )
                              }
                              style={{
                                background: '#10b981',
                                color: '#fff',
                                border: 'none',
                                padding: '5px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: 'bold'
                              }}
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
              <div
                style={{
                  background: '#1e293b',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #334155'
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#10b981'
                  }}
                >
                  <Package />
                  Nearby Available Resources ({resources.length})
                </h3>

                <div
                  style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    marginTop: '10px'
                  }}
                >
                  {resources.length === 0 ? (
                    <p style={{ color: '#94a3b8' }}>
                      No nearby resources found within 10km.
                    </p>
                  ) : (
                    resources.map((res) => (
                      <div
                        key={res._id}
                        style={{
                          background: '#0f172a',
                          padding: '10px',
                          borderRadius: '6px',
                          marginBottom: '10px',
                          borderLeft: '3px solid #10b981'
                        }}
                      >
                        <strong style={{ color: '#10b981' }}>
                          {(res.type || res.category || res.name || 'Resource').toUpperCase()}
                        </strong>
                        : {res.quantity ?? 1}

                        <div
                          style={{
                            fontSize: '12px',
                            color: '#94a3b8',
                            marginTop: '4px'
                          }}
                        >
                          {res.name ? `Name: ${res.name}` : ''}
                          {res.addressText ? ` | ${res.addressText}` : ' | Hyderabad'}
                          {' | Contact: '}{res.contact || 'N/A'}
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
