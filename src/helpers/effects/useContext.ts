import contextQueue from './contextQueue';
import { providers } from './useProvider';

const useContext = <T>(name: string): T => providers[`${contextQueue.getInitializationId()}.${name}`] as T;

export default useContext;
