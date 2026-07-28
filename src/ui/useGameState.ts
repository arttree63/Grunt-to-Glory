import { useGame } from '../store/gameStore'
import type { GameState } from '../core/types'

/** state 物件是原地變動的,統一靠 rev 觸發重繪 */
export function useGameState(): GameState {
  useGame((st) => st.rev)
  return useGame.getState().s
}
