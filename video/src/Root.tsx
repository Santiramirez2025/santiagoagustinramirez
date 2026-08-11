import React from 'react';
import { Composition } from 'remotion';
import { Reel } from './Video';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Reel"
      component={Reel}
      durationInFrames={660}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
