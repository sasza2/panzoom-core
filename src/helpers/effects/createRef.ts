import { Ref } from 'types';

const createRef = <T> (value?: T): Ref<T> => ({ current: value });

export default createRef;
