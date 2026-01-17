import React, { DependencyList, EffectCallback } from 'react';

const useUpdateEffectOnce = (
  callback: EffectCallback,
  dependencies: DependencyList,
) => {
  const didMountRef = React.useRef(false);
  const didUpdateOnce = React.useRef(false);

  React.useEffect(() => {
    if (didMountRef.current) {
      if (!didUpdateOnce.current) {
        callback();
        didUpdateOnce.current = true;
      }
    } else {
      didMountRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
};

export default useUpdateEffectOnce;
