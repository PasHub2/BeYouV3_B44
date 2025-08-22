
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Sparkles,
  Clock,
  Bell,
  BellOff,
  Camera // Added Camera icon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from '@/api/entities';
import LoggedOutView from '../components/auth/LoggedOutView';

export default function Activity() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'like',
      user: { username: 'alice_moments', avatar: null },
      moment: { title: 'Sunset at the beach', image_url: null }, // Changed to null
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false
    },
    {
      id: 2,
      type: 'comment',
      user: { username: 'photographer_bob', avatar: null },
      moment: { title: 'City lights at night', image_url: null }, // Changed to null
      comment: 'Amazing capture! The lighting is perfect.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: false
    },
    {
      id: 3,
      type: 'follow',
      user: { username: 'nature_lover', avatar: null },
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      read: true
    },
    {
      id: 4,
      type: 'mint',
      moment: { title: 'Morning coffee ritual', image_url: null }, // Changed to null
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      read: true
    }
  ]);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        await User.me();
        setIsLoggedIn(true);
        // In a real app, you would fetch real notifications here.
      } catch (error) {
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const getActivityIcon = (type) => {
    const iconProps = { className: "w-5 h-5" };
    switch (type) {
      case 'like': return <Heart {...iconProps} className="w-5 h-5 text-red-400" />;
      case 'comment': return <MessageCircle {...iconProps} className="w-5 h-5 text-blue-400" />;
      case 'follow': return <UserPlus {...iconProps} className="w-5 h-5 text-green-400" />;
      case 'mint': return <Sparkles {...iconProps} className="w-5 h-5 text-purple-400" />;
      default: return <Bell {...iconProps} className="w-5 h-5 text-gray-400" />;
    }
  };

  const getActivityMessage = (notification) => {
    switch (notification.type) {
      case 'like':
        return (
          <span>
            <span className="font-semibold text-white">{notification.user.username}</span>
            <span className="text-white/70"> liked your moment </span>
            <span className="font-medium text-white">"{notification.moment.title}"</span>
          </span>
        );
      case 'comment':
        return (
          <span>
            <span className="font-semibold text-white">{notification.user.username}</span>
            <span className="text-white/70"> commented on </span>
            <span className="font-medium text-white">"{notification.moment.title}"</span>
            {notification.comment && (
              <div className="mt-2 text-white/80 text-sm italic">
                "{notification.comment}"
              </div>
            )}
          </span>
        );
      case 'follow':
        return (
          <span>
            <span className="font-semibold text-white">{notification.user.username}</span>
            <span className="text-white/70"> started following you</span>
          </span>
        );
      case 'mint':
        return (
          <span>
            <span className="text-white/70">Your moment </span>
            <span className="font-medium text-white">"{notification.moment.title}"</span>
            <span className="text-white/70"> was successfully minted as an NFT</span>
          </span>
        );
      default:
        return <span className="text-white/70">New activity</span>;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const filterOptions = [
    { value: 'all', label: 'All Activity', count: notifications.length },
    { value: 'unread', label: 'Unread', count: unreadCount },
    { value: 'like', label: 'Likes', count: notifications.filter(n => n.type === 'like').length },
    { value: 'comment', label: 'Comments', count: notifications.filter(n => n.type === 'comment').length },
    { value: 'follow', label: 'Follows', count: notifications.filter(n => n.type === 'follow').length },
    { value: 'mint', label: 'NFT Mints', count: notifications.filter(n => n.type === 'mint').length },
  ];

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-white/20 border-t-purple-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <LoggedOutView
        icon={Bell}
        title="Your Activity"
        message="Log in to see your notifications, likes, comments, and other interactions."
        buttonText="Log In to View Activity"
      />
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">
                Activity
              </h1>
              <p className="text-white/70 text-lg">
                Stay updated with your community interactions
              </p>
            </div>
            
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <BellOff className="w-4 h-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="glass-effect border-white/20">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-5 h-5 text-red-400" />
                </div>
                <div className="text-2xl font-bold text-white">{notifications.filter(n => n.type === 'like').length}</div>
                <div className="text-white/60 text-sm">Likes</div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-white/20">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white">{notifications.filter(n => n.type === 'comment').length}</div>
                <div className="text-white/60 text-sm">Comments</div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-white/20">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                  <UserPlus className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white">{notifications.filter(n => n.type === 'follow').length}</div>
                <div className="text-white/60 text-sm">Followers</div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-white/20">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-2xl font-bold gradient-text">{notifications.filter(n => n.type === 'mint').length}</div>
                <div className="text-white/60 text-sm">NFTs Minted</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-2xl p-4 mb-6"
        >
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                variant={filter === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(option.value)}
                className={filter === option.value 
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0'
                  : 'bg-white/8 border-white/20 text-white/80 hover:bg-white/15 hover:text-white'
                }
              >
                {option.label}
                {option.count > 0 && (
                  <Badge className="ml-2 bg-white/20 text-white/90 text-xs">
                    {option.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {filteredNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 glass-effect rounded-2xl"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-6">
                  <Bell className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No activity yet</h3>
                <p className="text-white/60">
                  Start engaging with the community to see activity here!
                </p>
              </motion.div>
            ) : (
              filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`glass-effect border-white/20 hover:shadow-lg transition-all duration-300 ${
                    !notification.read ? 'ring-2 ring-purple-500/30' : ''
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Activity Icon */}
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(notification.type)}
                        </div>

                        {/* User Avatar (if applicable) */}
                        {notification.user && (
                          <Avatar className="w-10 h-10 flex-shrink-0">
                            <AvatarImage src={notification.user.avatar} />
                            <AvatarFallback className="bg-gradient-to-r from-purple-400 to-blue-400 text-white">
                              {notification.user.username[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm mb-2">
                            {getActivityMessage(notification)}
                          </div>
                          
                          <div className="flex items-center gap-2 text-white/50 text-xs">
                            <Clock className="w-3 h-3" />
                            {format(notification.timestamp, 'MMM d, yyyy • h:mm a')}
                            {!notification.read && (
                              <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30 text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Moment Image (if applicable) */}
                        <div className="flex-shrink-0">
                          {notification.moment?.image_url ? (
                            <img 
                              src={notification.moment.image_url} 
                              alt={notification.moment.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : notification.moment ? ( // Check if moment exists even if image_url is null
                            <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center">
                              <Camera className="w-5 h-5 text-gray-500" />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
