// AlignUI Drawer v0.0.0

'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { RiCloseLine } from '@remixicon/react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import * as CompactButton from './compact-button';
import { cn } from '@/lib/tailwind';

const DrawerRoot = DialogPrimitive.Root;
DrawerRoot.displayName = 'Drawer';

const DrawerTrigger = DialogPrimitive.Trigger;
DrawerTrigger.displayName = 'DrawerTrigger';

const DrawerClose = DialogPrimitive.Close;
DrawerClose.displayName = 'DrawerClose';

const DrawerPortal = DialogPrimitive.Portal;
DrawerPortal.displayName = 'DrawerPortal';

const DrawerOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...rest }, forwardedRef) => {
  return (
    <DialogPrimitive.Overlay
      ref={forwardedRef}
      className={cn(
        // base
        'bg-overlay bg-bg-white-0/50 fixed inset-0 z-50 grid grid-cols-1 place-items-start overflow-hidden',
        // animation
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className,
      )}
      {...rest}
    />
  );
});
DrawerOverlay.displayName = 'DrawerOverlay';

const DrawerContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...rest }, forwardedRef) => {
  return (
    <DrawerPortal>
      <DrawerOverlay>
        <DialogPrimitive.Content
          ref={forwardedRef}
          className={cn(
            // base
            'size-full max-w-80 overflow-y-auto',
            'border-stroke-sub-300 bg-bg-white-0 border-r',
            // animation
            'data-[state=open]:animate-in data-[state=open]:duration-300 data-[state=open]:ease-out',
            'data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=closed]:ease-in',
            'data-[state=open]:slide-in-from-left-80',
            'data-[state=closed]:slide-out-to-left-80',
            className,
          )}
          {...rest}>
          <VisuallyHidden asChild>
            <DialogPrimitive.Title />
          </VisuallyHidden>
          <div className="relative flex size-full flex-col">{children}</div>
        </DialogPrimitive.Content>
      </DrawerOverlay>
    </DrawerPortal>
  );
});
DrawerContent.displayName = 'DrawerContent';

function DrawerHeader({
  className,
  children,
  showCloseButton = true,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  showCloseButton?: boolean;
}) {
  return (
    <div className={cn('border-stroke-soft-200 flex items-center gap-3 p-5', className)} {...rest}>
      {children}

      {showCloseButton && (
        <DrawerClose asChild>
          <CompactButton.Root variant="ghost" size="large">
            <CompactButton.Icon as={RiCloseLine} />
          </CompactButton.Root>
        </DrawerClose>
      )}
    </div>
  );
}
DrawerHeader.displayName = 'DrawerHeader';

const DrawerTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...rest }, forwardedRef) => {
  return (
    <DialogPrimitive.Title
      ref={forwardedRef}
      className={cn('text-label-lg text-text-strong-950 flex-1', className)}
      {...rest}
    />
  );
});
DrawerTitle.displayName = 'DrawerTitle';

function DrawerBody({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex-1', className)} {...rest}>
      {children}
    </div>
  );
}
DrawerBody.displayName = 'DrawerBody';

function DrawerFooter({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border-stroke-soft-200 flex items-center gap-4 p-5', className)} {...rest} />;
}
DrawerFooter.displayName = 'DrawerFooter';

export {
  DrawerRoot as Root,
  DrawerTrigger as Trigger,
  DrawerClose as Close,
  DrawerContent as Content,
  DrawerHeader as Header,
  DrawerTitle as Title,
  DrawerBody as Body,
  DrawerFooter as Footer,
};
