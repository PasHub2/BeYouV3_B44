
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Shield,
  Users,
  DollarSign,
  Globe,
  Sparkles,
  Award
} from "lucide-react";
import { motion } from "framer-motion";
import { CircleMembership } from '@/api/entities';

// This form is now used for BOTH quick post and detailed editing
export default function DualMomentForm({ 
  dualImages, 
  onSubmit, 
  onCancel, 
  isSubmitting = false,
  preselectedCircle = null,
  initialData = {}, // For edit mode
  isEditMode = false
}) {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    selectedCircle: initialData.circle_shares?.[0]?.circle_id || preselectedCircle || 'private',
    // Advanced fields for edit mode
    makePermanent: initialData.permanence_status === 'permanent' || false,
    startingPrice: initialData.startingPrice || '',
    whoCanPurchase: initialData.purchase_rules?.allowed || 'community'
  });

  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    // Only preselect if not in edit mode
    if (!isEditMode && preselectedCircle) {
      setFormData(prev => ({ ...prev, selectedCircle: preselectedCircle }));
    }
  }, [preselectedCircle, isEditMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!dualImages && !isEditMode) return; // dualImages is not required for edit mode

    const momentData = {
      ...formData,
      // These are only relevant for new posts, not for edits where they already exist
      ...(dualImages && { 
        capture_timestamp: dualImages.timestamp || new Date().toISOString(),
        back_image: dualImages.backImage,
        front_image: dualImages.frontImage,
      })
    };
    onSubmit(momentData);
  };

  const handleFlipImages = (e) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  const isPublicCircle = () => {
    const publicCircles = ['photography_community', 'asics_run_club'];
    return publicCircles.includes(formData.selectedCircle);
  };

  if (!dualImages && !isEditMode) {
    return null; // For new posts, dualImages are mandatory. For edits, they are optional (already exist).
  }

  // Handle case where dualImages might be null in edit mode (e.g., if only metadata is being edited)
  const mainImage = dualImages ? (isFlipped ? dualImages.frontImage.url : dualImages.backImage.url) : null;
  const overlayImage = dualImages ? (isFlipped ? dualImages.backImage.url : dualImages.frontImage.url) : null;

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {!isEditMode && (
           <div className="text-center">
            <h1 className="text-2xl font-bold gradient-text mb-2">
              Finalize Moment
            </h1>
            <p className="text-white/70 text-sm">
              Add a title and post quickly. You can edit details later.
            </p>
          </div>
        )}
       
        {dualImages && ( // Only show image preview if dualImages are provided
          <Card className="bg-white/5 border-white/10 overflow-hidden">
            <div 
              className="relative bg-black rounded-t-xl overflow-hidden cursor-pointer" 
              style={{ aspectRatio: '4/5' }}
              onClick={handleFlipImages}
            >
              <img src={mainImage} alt="Captured moment" className="w-full h-full object-cover" />
              <img src={overlayImage} alt="Switch view" className="absolute bottom-4 right-4 w-1/4 h-1/4 object-cover rounded-lg border-2 border-white/50" />
              <div className="absolute top-4 left-4 bg-green-500/90 rounded-full px-3 py-1 flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-white" />
                <span className="text-white text-xs font-medium">Authentic</span>
              </div>
            </div>
          </Card>
        )}

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title" className="block text-white text-sm font-medium mb-2">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12"
                  placeholder="e.g., Beautiful sunset over the lake"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="block text-white text-sm font-medium mb-2">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-24"
                  placeholder="Add more details about this moment..."
                />
              </div>

              {isEditMode && (
                <>
                <div className="border-t border-white/10 pt-6 space-y-6">
                   <h3 className="text-lg font-semibold text-white">Advanced Options</h3>
                   <div className="flex items-center justify-between bg-white/10 p-4 rounded-lg">
                      <Label htmlFor="make-permanent" className="flex flex-col gap-1">
                        <span className="font-medium text-white">Make Permanent</span>
                        <span className="text-white/60 text-xs">Secure this moment on the blockchain forever.</span>
                      </Label>
                      <Switch
                        id="make-permanent"
                        checked={formData.makePermanent}
                        onCheckedChange={(checked) => setFormData({...formData, makePermanent: checked, startingPrice: checked ? formData.startingPrice : ''})}
                      />
                    </div>
                    
                    {formData.makePermanent && isPublicCircle() && (
                      <motion.div initial={{opacity: 0, y: -10}} animate={{opacity: 1, y: 0}} className="space-y-4">
                        <div>
                          <Label htmlFor="price" className="block text-white text-sm font-medium mb-2">Set Starting Price (YOU Tokens)</Label>
                          <Input
                            id="price"
                            type="number"
                            value={formData.startingPrice}
                            onChange={(e) => setFormData({...formData, startingPrice: e.target.value})}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12"
                            placeholder="e.g., 10"
                          />
                        </div>
                      </motion.div>
                    )}
                </div>
                </>
              )}

              <div className="flex gap-4 pt-4">
                <Button type="button" onClick={onCancel} variant="outline" className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/5 h-12" disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0 h-12" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Moment' : 'Quick Post')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
