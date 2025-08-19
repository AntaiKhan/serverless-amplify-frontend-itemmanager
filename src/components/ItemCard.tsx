import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Item } from '@/services/api';

interface ItemCardProps {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
  onView: (item: Item) => void;
}

export function ItemCard({ item, onEdit, onDelete, onView }: ItemCardProps) {
  return (
    <Card className="group hover:shadow-glow transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-card to-accent/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {item.name}
          </CardTitle>
          {item.category && (
            <Badge variant="secondary" className="ml-2">
              {item.category}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">ID:</span> {item.id}
          </div>
          
          {item.price && (
            <div className="text-sm font-medium text-primary">
              <span className="text-muted-foreground">Price:</span> {item.price}
            </div>
          )}
          
          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          )}
          
          {(item.createdAt || item.updatedAt) && (
            <div className="text-xs text-muted-foreground space-y-1">
              {item.createdAt && (
                <div>Created: {new Date(item.createdAt).toLocaleDateString()}</div>
              )}
              {item.updatedAt && (
                <div>Updated: {new Date(item.updatedAt).toLocaleDateString()}</div>
              )}
            </div>
          )}
          
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView(item)}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(item)}
              className="flex-1"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(item.id)}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}