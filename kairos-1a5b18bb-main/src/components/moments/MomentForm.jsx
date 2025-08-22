
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  MapPin, 
  Hash, 
  Upload, 
  Sparkles,
  Globe,
  Users,
  Lock,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MomentForm({ imageFile, imageUrl, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    visibility: 'public',
    tags: [],
    location: ''
  });
  const [currentTag, setCurrentTag] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    onSubmit({
      ...formData,
      image_file: imageFile,
      image_url: imageUrl
    });
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  const visibilityOptions = [
    { value: 'public', label: 'Public', icon: Globe, description: 'Anyone can see this moment' },
    { value: 'friends', label: 'Friends', icon: Users, description: 'Only your friends can see this' },
    { value: 'private', label: 'Private', icon: Lock, description: 'Only you can see this moment' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="glass-effect border-white/20 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Create Your Moment
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Image Preview */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-black/20">
            <img 
              src={imageUrl} 
              alt="Moment preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-white font-medium text-sm">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Give your moment a title..."
                className="glass-effect border-white/20 text-white placeholder:text-white/50"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-white font-medium text-sm">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Tell the story behind this moment..."
                className="glass-effect border-white/20 text-white placeholder:text-white/50 h-24 resize-none"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-white font-medium text-sm">Tags</label>
              <div className="flex gap-2">
                <Input
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag..."
                  className="glass-effect border-white/20 text-white placeholder:text-white/50 flex-1"
                />
                <Button
                  type="button"
                  onClick={addTag}
                  variant="outline"
                  size="icon"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Hash className="w-4 h-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <Badge 
                      key={index}
                      className="bg-purple-500/20 text-purple-200 border-purple-400/30 pr-1"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-purple-300 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-white font-medium text-sm">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Where was this taken?"
                  className="glass-effect border-white/20 text-white placeholder:text-white/50 pl-10"
                />
              </div>
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <label className="text-white font-medium text-sm">Visibility</label>
              <Select 
                value={formData.visibility} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, visibility: value }))}
              >
                <SelectTrigger className="glass-effect border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="menu-glass-effect">
                  {visibilityOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value} className="text-white hover:!bg-white/10 focus:!bg-white/10">
                        <div className="flex items-center gap-3 py-2">
                          <Icon className="w-5 h-5" />
                          <div>
                            <p className="font-medium">{option.label}</p>
                            <p className="text-xs text-white/60">{option.description}</p>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 border-white/20 text-white hover:bg-white/10"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                disabled={isSubmitting || !formData.title.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Create Moment
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
