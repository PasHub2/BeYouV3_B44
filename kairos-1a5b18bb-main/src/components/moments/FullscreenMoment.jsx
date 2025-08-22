import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';
import { MapPin, Users, Heart, Edit, Trash2, Share2, FileText, X, RotateCcw, Star, Award, Check } from 'lucide-react';
import { Moment } from '@/api/entities';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icon path issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});


// Note taking modal
function NoteModal({ moment, onSave, onClose }) {
    const [notes, setNotes] = useState(moment.private_notes || '');

    const handleSave = () => {
        onSave(moment, notes);
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#2d2a3d] rounded-2xl p-6 w-full max-w-sm border border-white/10"
            >
                <h3 className="text-lg font-bold text-white mb-4">Private Note</h3>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What was on your mind? ✨"
                    className="w-full h-32 bg-[#1a1f2e] border border-gray-600 rounded-lg p-3 text-white/90 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                    autoFocus
                />
                <div className="flex justify-end gap-3 mt-4">
                    <button onClick={onClose} className="text-sm text-white/70 hover:text-white">Cancel</button>
                    <button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-1.5 px-4 rounded-lg flex items-center gap-2">
                        <Check className="w-4 h-4"/>
                        Save Note
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default function FullscreenMoment({ moment, onMomentUpdate, onMomentDelete, onClose }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);

    const handleFlipCamera = (e) => {
        e.stopPropagation();
        setIsFlipped(!isFlipped);
    };

    const handleFavoriteToggle = async (e) => {
        e.stopPropagation();
        const updatedMoment = { ...moment, is_favorite: !moment.is_favorite };
        onMomentUpdate(updatedMoment);
        await Moment.update(moment.id, { is_favorite: updatedMoment.is_favorite });
    };
    
    const handleSaveNote = async (targetMoment, notes) => {
        const updatedMoment = { ...targetMoment, private_notes: notes };
        onMomentUpdate(updatedMoment);
        await Moment.update(targetMoment.id, { private_notes: notes });
    };
    
    const handleDelete = async (e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this moment forever?")) {
            await Moment.delete(moment.id);
            onMomentDelete(moment.id);
        }
    };

    const mainImage = isFlipped ? moment.front_camera_url : moment.back_camera_url;
    const secondaryImage = isFlipped ? moment.back_camera_url : moment.front_camera_url;
    
    const timeLabel = useMemo(() => {
        try {
            return format(new Date(moment.capture_timestamp), 'MMMM d, yyyy \'at\' HH:mm');
        } catch {
            return 'Invalid date';
        }
    }, [moment.capture_timestamp]);
    
    return (
        <>
            <motion.div
                layoutId={`moment-card-${moment.id}`}
                className="bg-[#2d2a3d]/80 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-black/50 overflow-hidden w-full max-w-sm mx-auto"
                style={{ aspectRatio: '9 / 18' }} // Portrait aspect ratio
            >
                <div className="relative w-full h-full flex flex-col">
                    {/* Image Container */}
                    <div className="relative w-full flex-grow bg-black">
                        <img
                            src={mainImage}
                            alt={moment.title || 'Diary Moment'}
                            className="w-full h-full object-cover"
                        />
                        
                        {/* PIP Toggle */}
                        {secondaryImage && (
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleFlipCamera}
                                className="absolute bottom-3 right-3 w-16 h-24 sm:w-20 sm:h-28 rounded-lg overflow-hidden border-2 border-white/40 shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                            >
                                <img src={secondaryImage} alt="Secondary View" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <RotateCcw className="w-4 h-4 text-white" />
                                </div>
                            </motion.button>
                        )}
                    </div>
    
                    {/* Content Container */}
                    <div className="p-4 space-y-3">
                         <div className="flex justify-between items-start">
                            <h2 className="text-lg font-bold text-white">{moment.title}</h2>
                            <button onClick={handleFavoriteToggle}>
                                <Heart className={`w-5 h-5 transition-colors ${moment.is_favorite ? 'text-red-400 fill-current' : 'text-white/60 hover:text-red-400'}`}/>
                            </button>
                        </div>
                        
                        {moment.private_notes && (
                             <p className="text-white/70 text-sm leading-relaxed border-l-2 border-purple-400/50 pl-3">
                                {moment.private_notes}
                            </p>
                        )}

                        <div className="flex items-center gap-2 text-white/60 text-xs cursor-pointer" onClick={() => setShowNoteModal(true)}>
                            <Edit className="w-3 h-3"/>
                            <span>{moment.private_notes ? 'Edit note' : 'Add a private note...'}</span>
                        </div>
    
                        {moment.location?.address && (
                            <div className="flex items-center gap-2 text-white/60 text-xs">
                                <MapPin className="w-3 h-3" />
                                <p className="truncate">{moment.location.address}</p>
                            </div>
                        )}
                        
                        <p className="text-white/50 text-xs pt-2 border-t border-white/10">{timeLabel}</p>
                        
                        <div className="flex justify-end gap-2">
                            <button onClick={handleDelete} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs px-3 py-1 rounded-lg">Delete</button>
                            <button onClick={() => alert('Sharing coming soon!')} className="bg-white/10 text-white hover:bg-white/20 text-xs px-3 py-1 rounded-lg">Share</button>
                        </div>
                    </div>
                </div>
            </motion.div>
            
            <AnimatePresence>
              {showNoteModal && (
                  <NoteModal moment={moment} onSave={handleSaveNote} onClose={() => setShowNoteModal(false)} />
              )}
            </AnimatePresence>
        </>
    );
}