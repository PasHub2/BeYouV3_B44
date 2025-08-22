
import React, { useState, useEffect } from 'react';
import { Moment, User } from '@/api/entities';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { List, Grid3x3, Map, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import DiaryCard from '../components/moments/DiaryCard';
import ProfileHeader from '../components/you/ProfileHeader';
import MomentGridItem from '../components/you/MomentGridItem';
import MomentsMapView from '../components/maps/MomentsMapView';
import FullscreenMoment from '../components/moments/FullscreenMoment'; // For detail view

// Helper to group moments by date for Diary View
const groupMomentsByDate = (moments) => {
    return moments.reduce((acc, moment) => {
        const date = parseISO(moment.capture_timestamp);
        let dateKey;
        if (isToday(date)) dateKey = 'Today';
        else if (isYesterday(date)) dateKey = 'Yesterday';
        else dateKey = format(date, 'EEEE, MMMM d');
        
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(moment);
        return acc;
    }, {});
};

export default function You() {
    const [moments, setMoments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [viewMode, setViewMode] = useState('diary'); // diary, grid, map
    const [selectedMomentIndex, setSelectedMomentIndex] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadPersonalData = async () => {
            setLoading(true);
            try {
                const user = await User.me();
                setCurrentUser(user);
                const fetchedMoments = await Moment.filter({ created_by: user.email }, '-capture_timestamp', 200);
                setMoments(fetchedMoments);
            } catch (error) {
                console.log('Error loading user data, might not be logged in.', error);
                setMoments([]);
            }
            setLoading(false);
        };
        loadPersonalData();
    }, []);

    const handleMomentUpdate = (updatedMoment) => {
        setMoments(prev => prev.map(m => (m.id === updatedMoment.id ? updatedMoment : m)));
    };
    
    const handleMomentDelete = (deletedMomentId) => {
        setMoments(prev => prev.filter(m => m.id !== deletedMomentId));
        setSelectedMomentIndex(null); // Close detail view if deleted
    };
    
    const openDetailView = (moment) => {
        const index = moments.findIndex(m => m.id === moment.id);
        if(index !== -1) setSelectedMomentIndex(index);
    };
    
    const navigateDetailView = (direction) => {
        if (selectedMomentIndex === null) return;
        const newIndex = selectedMomentIndex + direction;
        if (newIndex >= 0 && newIndex < moments.length) {
            setSelectedMomentIndex(newIndex);
        }
    };

    const groupedMoments = viewMode === 'diary' ? groupMomentsByDate(moments) : null;

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-[#1a1f2e]">
                <div className="w-8 h-8 border-4 border-white/20 border-t-purple-500 rounded-full animate-spin" />
            </div>
        );
    }
    
    if (!loading && moments.length === 0) {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center text-center p-4 bg-[#1a1f2e]">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-800/80 to-blue-800/80 flex items-center justify-center mb-6">
                    <BookOpen className="w-10 h-10 text-white/80" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Your Diary is a Blank Canvas</h2>
                <p className="text-white/60 max-w-xs mb-8">Capture your first authentic moment to begin your private journey.</p>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate(createPageUrl("Capture"))} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg">
                    Capture a Moment
                </motion.button>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-[#1a1f2e] p-2 sm:p-4 pb-24">
            <div className="max-w-3xl mx-auto">
                <ProfileHeader user={currentUser} moments={moments} />

                {/* View Mode Toggle */}
                <div className="flex justify-center items-center bg-[#2d2a3d]/40 backdrop-blur-lg p-1 rounded-full mb-6 border border-white/10">
                    {[
                        { mode: 'diary', icon: List },
                        { mode: 'grid', icon: Grid3x3 },
                        { mode: 'map', icon: Map }
                    ].map(({ mode, icon: Icon }) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-colors flex-1 text-center ${
                                viewMode === mode ? 'text-white' : 'text-white/60 hover:text-white'
                            }`}
                        >
                            {viewMode === mode && (
                                <motion.div
                                    layoutId="viewModeHighlight"
                                    className="absolute inset-0 bg-white/10 rounded-full"
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <Icon className="w-4 h-4" /> {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Content based on View Mode */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={viewMode}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {viewMode === 'diary' && (
                            <div className="space-y-8">
                                {Object.entries(groupedMoments).map(([date, momentsOnDate]) => (
                                    <div key={date}>
                                        <h2 className="text-center text-white/50 text-xs sm:text-sm font-semibold mb-3">{date}</h2>
                                        <div className="space-y-6">
                                            {momentsOnDate.map(moment => (
                                                <DiaryCard key={moment.id} moment={moment} onMomentUpdate={handleMomentUpdate} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {viewMode === 'grid' && (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4">
                                {moments.map(moment => (
                                    <MomentGridItem key={moment.id} moment={moment} onClick={openDetailView} />
                                ))}
                            </div>
                        )}
                        {viewMode === 'map' && (
                           <div className="h-[60vh]">
                               <MomentsMapView 
                                   moments={moments} 
                                   onMomentSelect={(index) => setSelectedMomentIndex(index)}
                               />
                           </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Fullscreen Detail View Modal */}
            <AnimatePresence>
                {selectedMomentIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedMomentIndex(null)}
                    >
                         <button onClick={(e) => { e.stopPropagation(); navigateDetailView(-1); }} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 p-2 rounded-full hover:bg-white/20 disabled:opacity-50" disabled={selectedMomentIndex === 0}><ChevronLeft/></button>
                        <button onClick={(e) => { e.stopPropagation(); navigateDetailView(1); }} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 p-2 rounded-full hover:bg-white/20 disabled:opacity-50" disabled={selectedMomentIndex === moments.length - 1}><ChevronRight/></button>
                        <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm">
                             <FullscreenMoment 
                                moment={moments[selectedMomentIndex]} 
                                onMomentUpdate={handleMomentUpdate}
                                onMomentDelete={handleMomentDelete}
                                onClose={() => setSelectedMomentIndex(null)}
                             />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
