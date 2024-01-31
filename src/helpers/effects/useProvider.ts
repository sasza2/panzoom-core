import contextQueue from './contextQueue';
import useEffect from './useEffect';
import { Value } from './types';

export const providers: Record<string, unknown> = {};

const useProvider = (name: string, context: Value) => {
  useEffect(() => {
    const id = `${contextQueue.getInitializationId()}.${name}`;
    providers[id] = context;
    return () => {
      delete providers[id];
    };
  }, [context]);
};

export default useProvider;
