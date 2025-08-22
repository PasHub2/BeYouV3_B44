
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';
import { MapPin, Users, Heart, Edit, FileText, RotateCcw, Star, Award, MessageSquarePlus } from 'lucide-react';
import { Moment } from '@/api/entities';
import 'leaflet/dist/leaflet.css';

// Reusable Circle Badge
function CircleBadge({ circleShare }) {
    if (!circleShare || circleShare.circle_id === 'private') return null;

    const getCircleInfo = (circleId) => {
        const circles = {
            'trust_circle': { name: 'Trust', icon: Users, color: 'bg-blue-500' },
            'photography_community': { name: 'Photo', icon: Award, color: 'bg-purple-500' },
            'asics_run_club': { name: 'ASICS', icon: Star, color: 'bg-green-500' }
        };
        return circles[circleId] || { name: 'Circle', icon: Users, color: 'bg-gray-500' };
    };

    const circle = getCircleInfo(circleShare.circle_id);
    const CircleIcon = circle.icon;

    return (
        <div className={`flex items-center gap-1 ${circle.color} bg-opacity-80 backdrop-blur-sm px-2 py-1 rounded-full`}>
            <CircleIcon className="w-3 h-3 text-white" />
            <span className="text-white text-xs font-medium">{circle.name}</span>
        </div>
    );
}

export default function DiaryCard({ moment, onMomentUpdate }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [notes, setNotes] = useState(moment.private_notes || '');

    const handleFlipCamera = (e) => {
        e.stopPropagation();
        setIsFlipped(!isFlipped);
    };

    const handleSaveNote = async () => {
        if (notes === moment.private_notes) {
            setIsEditingNotes(false);
            return;
        }
        const updatedMoment = { ...moment, private_notes: notes };
        await Moment.update(moment.id, { private_notes: notes });
        onMomentUpdate(updatedMoment);
        setIsEditingNotes(false);
    };

    const mainImage = isFlipped ? moment.front_camera_url : moment.back_camera_url;
    const secondaryImage = isFlipped ? moment.back_camera_url : moment.front_camera_url;

    const timeLabel = format(new Date(moment.capture_timestamp), 'HH:mm');

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="bg-[#2d2a3d]/50 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/30 overflow-hidden"
        >
            {/* Image Container - Corrected aspect ratio for mobile phones */}
            <div className="relative w-full aspect-[3/4] bg-black">
                <img
                    src={mainImage}
                    alt={moment.title || 'Diary Moment'}
                    className="w-full h-full object-cover"
                />
                
                {/* PIP Toggle - Adjusted size for mobile */}
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

                {/* Top Info Overlay */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                     <div className="bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs font-medium">
                        {timeLabel}
                    </div>
                    {moment.is_favorite && (
                        <div className="bg-black/50 backdrop-blur-sm p-1.5 rounded-full">
                            <Heart className="w-3 h-3 text-red-400 fill-red-400" />
                        </div>
                    )}
                </div>
                 <div className="absolute top-3 right-3">
                   <CircleBadge circleShare={moment.circle_shares && moment.circle_shares[0]} />
                </div>
            </div>

            {/* Content Container (Notes & Location) */}
            <div className="p-3 sm:p-4">
                {isEditingNotes ? (
                    <div className="flex flex-col gap-3">
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="What's on your mind? ✨"
                            className="w-full h-28 bg-[#1a1f2e] border border-gray-600 rounded-lg p-3 text-white/90 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsEditingNotes(false)} className="text-xs text-white/70 hover:text-white">Cancel</button>
                            <button onClick={handleSaveNote} className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold py-1 px-3 rounded-md">Save</button>
                        </div>
                    </div>
                ) : (
                    <div className="min-h-[5rem] group" onClick={() => setIsEditingNotes(true)}>
                        {moment.private_notes ? (
                            <p className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed cursor-pointer">
                                {moment.private_notes}
                            </p>
                        ) : (
                            <div className="flex items-center justify-center h-full text-white/40 group-hover:text-white/60 transition-colors cursor-pointer">
                                <MessageSquarePlus className="w-4 h-4 mr-2"/>
                                <span className="text-sm">Add a thought...</span>
                            </div>
                        )}
                    </div>
                )}
                
                {moment.location?.address && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                        <MapPin className="w-3 h-3 text-white/50" />
                        <p className="text-white/60 text-xs truncate">{moment.location.address}</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
