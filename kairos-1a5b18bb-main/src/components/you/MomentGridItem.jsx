import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Lock } from 'lucide-react';

export default function MomentGridItem({ moment, onClick }) {
  const imageUrl = moment.back_camera_url || moment.front_camera_url;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative aspect-square cursor-pointer group"
      onClick={() => onClick(moment)}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={moment.title || 'Moment'}
          className="w-full h-full object-cover rounded-lg"
        />
      ) : (
        <div className="w-full h-full bg-[#2d2a3d] rounded-lg flex items-center justify-center">
          <Camera className="w-8 h-8 text-white/30" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <p className="text-white font-semibold text-sm truncate px-2">{moment.title}</p>
      </div>
      {moment.visibility === 'private' && (
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm p-1 rounded-full">
          <Lock className="w-3 h-3 text-white/80" />
        </div>
      )}
    </motion.div>
  );
}