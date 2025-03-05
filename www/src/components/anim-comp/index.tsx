import { createAnim, Anim, AnimProps } from '@/components/anim-comp/anim';
import { cn } from '@/utils/cn';
import { ClassValue } from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { LoaderCircle } from 'lucide-react';

type AnimWrapperProps = {
  className?: ClassValue;
};

export function AnimComp({
  className,
  ...animProps
}: AnimWrapperProps & AnimProps) {
  const anim = useRef<Anim>(null);
  const containingDiv = useRef(null);

  const [isLoading, setIsLoading] = useState(false); // Used for the loader

  // Create and destroy

  useEffect(() => {
    if (containingDiv.current) {
      const _anim = createAnim(animProps);
      if (_anim) {
        setIsLoading(true);
        anim.current = _anim; // For this comp to communicate with
        const initResult = _anim.init({
          parent: containingDiv.current,
          onLoaded: () => {
            setIsLoading(false);
          },
        });
        return () => {
          async function delayedDestroy() {
            anim.current = null; // Prevent references
            await initResult; // Ensure the init is complete before destroying (this is required for safe mode compatibility)
            _anim?.destroy(); // This may be async
          }
          delayedDestroy();
        };
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Needed to trigger HMR on anim change
  }, [createAnim]); // Triggers HMR when anim function changes

  // Communications:
  // via anim.current

  // Notes:

  return (
    <div
      ref={containingDiv}
      className={cn(
        'overflow-hidden', // Prevent the canvas pushing out the size of its own container
        'flex items-center justify-center', // Center the loader
        'bg-black',
        className,
      )}
    >
      <LoaderCircle
        className={cn(
          'animate-spin text-white/70 w-7 h-7 z-10 absolute',
          'pointer-events-none',
          'transition-opacity ease-in-out',
          isLoading
            ? 'opacity-100 delay-[1500ms] duration-1000' // Delay arrival
            : 'opacity-0 delay-[0ms] duration-400',
        )}
      />
    </div>
  );
}
