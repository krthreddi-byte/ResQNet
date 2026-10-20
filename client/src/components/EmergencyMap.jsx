import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Import Leaflet CSS directly to prevent broken/split tiles layout!
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue in Leaflet React
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

const customIcon = L.icon({
    iconUrl: markerIconPng,
    shadowUrl: markerShadowPng,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

const EmergencyMap = ({ emergencies = [] }) => {
    // Default center: Charminar, Hyderabad [lat, lng]
    const defaultCenter = [17.3850, 78.4867];

    return (
        <div style={{ height: '350px', width: '100%', position: 'relative' }} className="rounded-xl overflow-hidden shadow-lg border border-slate-700">
            <MapContainer
                center={defaultCenter}
                zoom={12}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {emergencies.map((item, index) => {
                    // GeoJSON is [lng, lat], Leaflet needs [lat, lng]
                    const coords = item.location?.coordinates;
                    const position = coords && coords.length === 2
                        ? [coords[1], coords[0]]
                        : defaultCenter;

                    return (
                        <Marker key={item._id || index} position={position} icon={customIcon}>
                            <Popup>
                                <div className="p-1">
                                    <h4 className="font-bold text-red-600">{item.emergencyType || item.type || 'Emergency Alert'}</h4>
                                    <p className="text-xs text-slate-800 my-1">{item.description}</p>
                                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">
                                        Status: {item.status || 'Pending'}
                                    </span>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default EmergencyMap;