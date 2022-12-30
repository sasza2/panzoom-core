import { ElementsContext } from 'types'
import { elementsContext } from './ElementsProvider'

const useElements = (): ElementsContext => elementsContext.current

export default useElements
