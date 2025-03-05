import { AnimComp } from '@/components/anim-comp';

import { useControls } from 'leva';

const modes = ['default'] as const;
// type DemoMode = (typeof demoModes)[number];

// Global pixi settings

function App() {
  const { mode } = useControls({
    mode: {
      options: modes,
      value: modes[0],
    },
  });

  return (
    mode && (
      <div className="flex flex-1">
        <AnimComp
          className="absolute w-full h-full p-0 self-stretch"
          tileDims={{ width: 16, height: 14 }}
          tileSize={18}
        />
      </div>
    )
  );
}

export default App;
