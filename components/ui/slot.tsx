import * as React from 'react';
import { Slot as SlotPrimitive } from '@radix-ui/react-slot';

const Slot = React.forwardRef<
  React.ElementRef<typeof SlotPrimitive>,
  React.ComponentPropsWithoutRef<typeof SlotPrimitive>
>(({ ...props }, ref) => <SlotPrimitive ref={ref} {...props} />);

Slot.displayName = SlotPrimitive.displayName;

export { Slot };

