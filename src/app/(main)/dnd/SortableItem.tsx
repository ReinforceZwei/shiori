import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Transform } from "@dnd-kit/utilities";

interface SortableItemProps {
  id: string;
  data?: Record<string, any>;
  children: React.ReactNode;
  restrictDirection?: 'vertical' | 'horizontal';
}
export function SortableItem({ id, data = {}, children, restrictDirection }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, data });

  // Apply directional restriction to the transform
  let restrictedTransform: Transform | null = transform;
  
  if (transform && restrictDirection) {
    if (restrictDirection === 'vertical') {
      // Only allow vertical movement (y-axis)
      restrictedTransform = {
        ...transform,
        x: 0,
      };
    } else if (restrictDirection === 'horizontal') {
      // Only allow horizontal movement (x-axis)
      restrictedTransform = {
        ...transform,
        y: 0,
      };
    }
  }

  const style = {
    transform: CSS.Transform.toString(restrictedTransform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}