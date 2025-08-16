import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Plus } from "lucide-react";
import { useState } from "react";
import { Comment } from "../litigation/types";

export interface CommentHistoryProps {
  comments: Comment[];
  placeholder?: string;
  field: any;
}

export default function CommentHistory({
  comments,
  placeholder,
  field,
}: CommentHistoryProps) {
  const [isAddingComment, setIsAddingComment] = useState(false);

  const handleCancel = () => {
    setIsAddingComment(false);
    field.onChange("");
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-muted-foreground" />
        <label className="text-sm font-medium text-foreground">
          Comentario
        </label>
      </div>

      {/* Comments History */}
      {comments.length > 0 && (
        <div className="space-y-2 max-h-32 overflow-y-auto px-2">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-comment-bg border border-comment-border rounded-md p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-foreground flex-1">
                  {comment.content}
                </p>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(new Date(comment.created_at))}
                </span>
              </div>
              {comment.user && (
                <p className="text-xs text-muted-foreground mt-1">
                  por {comment.user.first_name} {comment.user.last_name}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Comment Section */}
      {!isAddingComment ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddingComment(true)}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground border-dashed"
        >
          <Plus className="w-4 h-4" />
          Agregar comentario
        </Button>
      ) : (
        <div className="space-y-3">
          <FormItem>
            <FormLabel>Comentario</FormLabel>
            <FormControl>
              <Textarea
                placeholder={placeholder}
                className="min-h-[80px] resize-none"
                autoFocus
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
