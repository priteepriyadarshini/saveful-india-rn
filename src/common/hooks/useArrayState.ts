import { useState } from 'react';

const useArrayState = <T>(initialState: T[] = []) => {
  const [state, setState] = useState(initialState);

  const push = (item: T) => setState(prev => [...prev, item]);
  const remove = (index: number) =>
    setState(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
  const insertAtIndex = (index: number, item: T) =>
    setState(prev => [...prev.slice(0, index), item, ...prev.slice(index)]);
  const clear = () => setState([]);
  const set = (newState: T[]) => setState(newState);

  return [state, { push, remove, insertAtIndex, clear, set }] as const;
};

export default useArrayState;
