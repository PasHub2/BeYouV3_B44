import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Circle } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPageUrl } from '@/utils';

export default function CreateCircle() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'community',
    access_duration: '24h',
    privacy_level: 'private',
    join_cost: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name, checked) => {
    setFormData(prev => ({...prev, [name]: checked ? 'discoverable' : 'private' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      alert("Please fill out all required fields.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await Circle.create({
        name: formData.name,
        description: formData.description,
        type: formData.type,
        access_duration: formData.access_duration,
        privacy_level: formData.privacy_level,
        // brand_settings: { entry_cost: formData.join_cost } // Assuming cost is part of brand settings
      });
      navigate(createPageUrl('Circles'));
    } catch (error) {
      console.error("Failed to create circle:", error);
      alert("There was an error creating your circle. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 pb-32">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Create a New Circle</h1>
        
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-white">Circle Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required className="bg-white/10 border-white/20 text-white mt-2" />
              </div>

              <div>
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleChange} required className="bg-white/10 border-white/20 text-white mt-2" />
              </div>

              <div>
                <Label className="text-white">Category</Label>
                <Select name="type" onValueChange={(value) => handleSelectChange('type', value)} defaultValue="community">
                  <SelectTrigger className="bg-white/10 border-white/20 text-white mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111111] border-white/20 text-white">
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="brand">Commercial</SelectItem>
                    <SelectItem value="friends">Friends</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="join_cost" className="text-white">Entry Cost (YOU Tokens)</Label>
                <Input id="join_cost" name="join_cost" type="number" min="0" value={formData.join_cost} onChange={handleChange} className="bg-white/10 border-white/20 text-white mt-2" />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="privacy_level" className="text-white">Discoverable by Public</Label>
                <Switch 
                  id="privacy_level"
                  onCheckedChange={(checked) => handleSwitchChange('privacy_level', checked)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Circle'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}