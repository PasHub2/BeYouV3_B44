
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  Verified,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MomentCard({ moment, user, onLike, onComment, onShare, onMint, isOwner }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(moment.like_count || 0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike && onLike(moment.id, !isLiked);
  };

  const getStatusArea = () => {
    if (isOwner && moment.minting_status === 'pending') {
      return (
        <Button
          size="sm"
          className="bg-gradient-to-r from-green-400 to-teal-500 text-white shadow-lg hover:shadow-green-500/30 transition-shadow"
          onClick={() => onMint && onMint(moment.id)}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Mint NFT
        </Button>
      );
    }

    if (moment.minting_status === 'minting') {
        return (
            <Badge className="bg-blue-100 text-blue-800 border-0">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                MINTING...
            </Badge>
        );
    }

    if (moment.is_minted) {
        return (
            <Badge className="bg-green-100 text-green-800 border-0">
                <Verified className="w-3 h-3 mr-1" />
                NFT
            </Badge>
        );
    }

    return null; // Don't show anything if not owner and not minted
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="glass-effect border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-500">
        {/* User Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 ring-2 ring-white/20">
              <AvatarImage src={user?.profile_image_url} />
              <AvatarFallback className="bg-gradient-to-r from-purple-400 to-blue-400 text-white">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-white text-sm">{user?.username || 'Anonymous'}</p>
                {user?.is_verified && (
                  <Verified className="w-4 h-4 text-blue-400" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <Clock className="w-3 h-3" />
                {format(new Date(moment.created_date), 'MMM d, yyyy')}
                {moment.location?.address && (
                  <>
                    <span>•</span>
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-32">{moment.location.address}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getStatusArea()}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="menu-glass-effect text-white">
                <DropdownMenuItem className="hover:bg-white/10">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Blockchain
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-white/10">
                  <Share className="w-4 h-4 mr-2" />
                  Share Moment
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Image */}
        <CardContent className="p-0">
          <div className="relative aspect-square">
            <img
              src={moment.image_url}
              alt={moment.title}
              className="w-full h-full object-cover"
            />
          </div>
        </CardContent>

        {/* Content */}
        <div className="p-4">
          {/* Action Buttons */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleLike}
                className="flex items-center gap-1"
              >
                <Heart
                  className={`w-6 h-6 transition-all duration-200 ${
                    isLiked ? 'fill-red-500 text-red-500' : 'text-white/60 hover:text-red-400'
                  }`}
                />
                <span className="text-sm text-white/80 font-medium">{likesCount}</span>
              </motion.button>

              <button
                onClick={() => onComment && onComment(moment.id)}
                className="flex items-center gap-1 text-white/60 hover:text-white transition-colors"
              >
                <MessageCircle className="w-6 h-6" />
                <span className="text-sm font-medium">{moment.comment_count || 0}</span>
              </button>

              <button
                onClick={() => onShare && onShare(moment)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <Share className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Title and Description */}
          <div className="space-y-2">
            <h3 className="font-semibold text-white text-lg">{moment.title}</h3>
            {moment.description && (
              <div>
                <p className="text-white/80 text-sm leading-relaxed">
                  {showFullDescription || moment.description.length <= 100
                    ? moment.description
                    : `${moment.description.slice(0, 100)}...`}
                </p>
                {moment.description.length > 100 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors mt-1"
                  >
                    {showFullDescription ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Tags */}
          {moment.tags && moment.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {moment.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-white/10 text-white/80 border-white/20 text-xs"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
