import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Loader2 } from 'lucide-react';
import { ItemForm } from './ItemForm';
import { ItemCard } from './ItemCard';
import { apiService, Item } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export function ItemManager() {
  const [items, setItems] = useState<Item[]>([]);
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<Item | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [viewingItem, setViewingItem] = useState<Item | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: apiService.createItem,
    onSuccess: (data) => {
      setItems(prev => [...prev, data.item]);
      setShowCreateForm(false);
      toast({
        title: "Success",
        description: "Item created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, item }: { id: string; item: Partial<Item> }) => 
      apiService.updateItem(id, item),
    onSuccess: (data) => {
      setItems(prev => prev.map(item => 
        item.id === data.item.id ? data.item : item
      ));
      setEditingItem(null);
      toast({
        title: "Success",
        description: "Item updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: apiService.deleteItem,
    onSuccess: (_, itemId) => {
      setItems(prev => prev.filter(item => item.id !== itemId));
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    
    setIsSearching(true);
    try {
      const item = await apiService.getItem(searchId);
      setSearchResult(item);
      
      // Add to local items if not already present
      setItems(prev => {
        const exists = prev.find(existingItem => existingItem.id === item.id);
        return exists ? prev : [...prev, item];
      });
      
      toast({
        title: "Found",
        description: `Item "${item.name}" found successfully`,
      });
    } catch (error) {
      setSearchResult(null);
      toast({
        title: "Not Found",
        description: error instanceof Error ? error.message : "Item not found",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreate = (item: Omit<Item, 'createdAt' | 'updatedAt'>) => {
    createMutation.mutate(item);
  };

  const handleUpdate = (item: Omit<Item, 'createdAt' | 'updatedAt'>) => {
    if (!editingItem) return;
    updateMutation.mutate({ id: editingItem.id, item });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
            Item Manager
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your items with full CRUD operations
          </p>
        </div>

        {/* Search Section */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Item by ID
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter item ID"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                disabled={isSearching}
              />
              <Button 
                onClick={handleSearch} 
                disabled={!searchId.trim() || isSearching}
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Create Button */}
        <div className="flex justify-center">
          <Button 
            onClick={() => setShowCreateForm(true)}
            size="lg"
            className="shadow-glow"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Item
          </Button>
        </div>

        {/* Items Grid */}
        {items.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Your Items</h2>
              <Badge variant="secondary">{items.length} items</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onEdit={setEditingItem}
                  onDelete={handleDelete}
                  onView={setViewingItem}
                />
              ))}
            </div>
          </div>
        )}

        {items.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground text-lg">
                No items yet. Create your first item or search for an existing one.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Create Item Dialog */}
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Item</DialogTitle>
            </DialogHeader>
            <ItemForm
              onSubmit={handleCreate}
              onCancel={() => setShowCreateForm(false)}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Item Dialog */}
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Item</DialogTitle>
            </DialogHeader>
            {editingItem && (
              <ItemForm
                item={editingItem}
                onSubmit={handleUpdate}
                onCancel={() => setEditingItem(null)}
                isLoading={updateMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* View Item Dialog */}
        <Dialog open={!!viewingItem} onOpenChange={() => setViewingItem(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Item Details</DialogTitle>
            </DialogHeader>
            {viewingItem && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">ID</label>
                    <p className="text-sm font-mono bg-muted p-2 rounded">{viewingItem.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-sm p-2">{viewingItem.name}</p>
                  </div>
                </div>
                {viewingItem.category && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <p className="text-sm p-2">{viewingItem.category}</p>
                  </div>
                )}
                {viewingItem.description && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-sm p-2 bg-muted rounded">{viewingItem.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                  {viewingItem.createdAt && (
                    <div>
                      <label className="font-medium">Created</label>
                      <p>{new Date(viewingItem.createdAt).toLocaleString()}</p>
                    </div>
                  )}
                  {viewingItem.updatedAt && (
                    <div>
                      <label className="font-medium">Updated</label>
                      <p>{new Date(viewingItem.updatedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}