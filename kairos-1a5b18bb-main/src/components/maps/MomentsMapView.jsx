import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion } from 'framer-motion';

// Fix for default Leaflet icon path issue
delete L.Icon.Default.prototype._getIconUrl;
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

const customIcon = new L.Icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});


export default function MomentsMapView({ moments, onMomentSelect, onCenterMap }) {
    const locations = moments.filter(m => m.location?.latitude && m.location?.longitude);
    const center = onCenterMap || (locations.length > 0
      ? [locations[0].location.latitude, locations[0].location.longitude]
      : [51.505, -0.09]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full rounded-2xl overflow-hidden border border-white/10"
        >
            <MapContainer center={center} zoom={locations.length > 0 ? 8 : 2} scrollWheelZoom={true} className="w-full h-full bg-[#1a1f2e]">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                {locations.map(moment => (
                    <Marker
                        key={moment.id}
                        position={[moment.location.latitude, moment.location.longitude]}
                        icon={customIcon}
                        eventHandlers={{
                            click: () => {
                                if (onMomentSelect) {
                                    const index = moments.findIndex(m => m.id === moment.id);
                                    if (index !== -1) {
                                        onMomentSelect(index);
                                    }
                                }
                            },
                        }}
                    >
                        <Popup className="custom-leaflet-popup">
                            <div className="w-40 bg-[#2d2a3d] text-white p-0 rounded-lg overflow-hidden border border-white/20">
                                <img src={moment.back_camera_url} alt={moment.title} className="w-full h-20 object-cover" />
                                <div className="p-2">
                                    <p className="font-bold text-sm truncate">{moment.title}</p>
                                    <p className="text-xs text-white/70">{new Date(moment.capture_timestamp).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
            <style>{`
                .leaflet-popup-content-wrapper {
                    background: #2d2a3d;
                    color: #fff;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
                }
                .leaflet-popup-content {
                    margin: 0 !important;
                }
                .leaflet-popup-tip {
                    background: #2d2a3d;
                }
            `}</style>
        </motion.div>
    );
}