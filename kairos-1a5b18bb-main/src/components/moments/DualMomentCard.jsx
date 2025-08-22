import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  ArrowUpCircle,
  Pencil,
  Heart,
  MessageCircle,
  Share,
  Crown
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DualMomentCard({ moment, onStatusChange, onEdit, onViewDetail }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlipPictures = (e) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  const mainImage = isFlipped ? moment.front_camera_url : moment.back_camera_url;
  const secondaryImage = isFlipped ? moment.back_camera_url : moment.front_camera_url;

  const priorityColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800"
  };

  const statusIcons = {
    todo: <Circle className="w-5 h-5 text-gray-400" />,
    in_progress: <ArrowUpCircle className="w-5 h-5 text-blue-500" />,
    done: <CheckCircle2 className="w-5 h-5 text-green-500" />
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-xl mx-auto cursor-pointer"
      onClick={() => onViewDetail && onViewDetail(moment)}
    >
      <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
        <div className="relative bg-black rounded-t-xl overflow-hidden" style={{ aspectRatio: '3/4' }}>
          <img
            src={mainImage}
            alt={moment.title}
            className="w-full h-full object-cover"
          />

          {/* Dual Camera Overlay - CRITICAL: Always show tappable overlay */}
          {secondaryImage && (
            <button
              onClick={handleFlipPictures}
              className="absolute bottom-4 right-4 w-20 h-28 rounded-lg overflow-hidden border-2 border-white/50 shadow-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-300 hover:scale-105"
            >
              <img
                src={secondaryImage}
                alt="Switch view"
                className="w-full h-full object-cover"
              />
            </button>
          )}

          {/* Badges Display */}
          {moment.earnedBadges && moment.earnedBadges.length > 0 && (
            <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
              {moment.earnedBadges.map((badge, index) => {
                const BadgeIcon = badge.icon || Crown;
                return (
                  <motion.div
                    key={badge.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                    className="group relative"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20"
                      style={{ backgroundColor: badge.color }}
                      title={`${badge.name} - Earned in community`}
                    >
                      <BadgeIcon className="w-4 h-4 text-white" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 truncate flex-1">
              {moment.title}
            </h3>
            <div className="flex items-center gap-2 ml-2">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                <Heart className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                <MessageCircle className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                <Share className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {moment.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{moment.description}</p>
          )}

          <div className="flex flex-wrap gap-2 mb-3">
            {moment.tags && moment.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>

          {moment.created_date && (
            <p className="text-gray-400 text-xs">
              {format(new Date(moment.created_date), 'MMM d, yyyy • h:mm a')}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}