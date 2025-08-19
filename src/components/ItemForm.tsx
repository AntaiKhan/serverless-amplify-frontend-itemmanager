import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Item } from '@/services/api';

interface ItemFormProps {
  item?: Item;
  onSubmit: (item: Omit<Item, 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ItemForm({ item, onSubmit, onCancel, isLoading }: ItemFormProps) {
  const [formData, setFormData] = useState({
    id: item?.id || '',
    name: item?.name || '',
    description: item?.description || '',
    category: item?.category || '',
    price: item?.price || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id.trim() || !formData.name.trim()) return;
    onSubmit(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-card">
      <CardHeader>
        <CardTitle className="text-center bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
          {item ? 'Edit Item' : 'Create New Item'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id">ID</Label>
            <Input
              id="id"
              value={formData.id}
              onChange={(e) => handleChange('id', e.target.value)}
              placeholder="Enter unique ID"
              disabled={!!item || isLoading}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter item name"
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              placeholder="Enter category"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              placeholder="Enter price"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter description"
              disabled={isLoading}
              rows={3}
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={!formData.id.trim() || !formData.name.trim() || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : (item ? 'Update' : 'Create')}
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}