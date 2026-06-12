import { create } from 'zustand';

interface EngineAnalysis {
  depth: number;
  multipv: number;
  score_cp?: number;
  score_mate?: number;
  pv: string[];
  nodes?: number;
  time?: number;
}

interface ChessState {
  fen: string;
  setFen: (fen: string) => void;
  boardOrientation: 'white' | 'black';
  setBoardOrientation: (orientation: 'white' | 'black') => void;
  engineAnalysis: Record<number, EngineAnalysis>;
  updateEngineAnalysis: (data: EngineAnalysis) => void;
  clearEngineAnalysis: () => void;
  isEngineRunning: boolean;
  setEngineRunning: (running: boolean) => void;
  isMatchMode: boolean;
  setMatchMode: (matchMode: boolean) => void;
  isHumanVsEngine: boolean;
  setHumanVsEngine: (humanVsEngine: boolean) => void;
  engineSettings: {
    Threads: number;
    Hash: number;
    MultiPV: number;
    SkillLevel: number;
  };
  setEngineSetting: (name: string, value: number) => void;
  searchLimits: {
    depth: number;
    moveTime: number;
  };
  setSearchLimit: (name: string, value: number) => void;
  sendEngineCommand: ((cmd: any) => void) | null;
  setEngineCommandDispatcher: (dispatcher: (cmd: any) => void) => void;
}

export const useChessStore = create<ChessState>((set, get) => ({
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  setFen: (fen) => set({ fen }),
  
  boardOrientation: 'white',
  setBoardOrientation: (orientation) => set({ boardOrientation: orientation }),
  
  engineAnalysis: {},
  updateEngineAnalysis: (data) => set((state) => ({
    engineAnalysis: {
      ...state.engineAnalysis,
      [data.multipv || 1]: data
    }
  })),
  clearEngineAnalysis: () => set({ engineAnalysis: {} }),
  
  isEngineRunning: false,
  setEngineRunning: (running) => set({ isEngineRunning: running }),

  isMatchMode: false,
  setMatchMode: (matchMode) => set({ isMatchMode: matchMode }),

  isHumanVsEngine: false,
  setHumanVsEngine: (humanVsEngine) => set({ isHumanVsEngine: humanVsEngine }),

  searchLimits: {
    depth: 0,
    moveTime: 1000,
  },
  setSearchLimit: (name, value) => {
    set((state) => ({
      searchLimits: { ...state.searchLimits, [name]: value }
    }));
  },

  engineSettings: {
    Threads: 8,
    Hash: 8192,
    MultiPV: 5,
    SkillLevel: 20
  },
  setEngineSetting: (name, value) => {
    set((state) => ({
      engineSettings: { ...state.engineSettings, [name]: value }
    }));
    const send = get().sendEngineCommand;
    if (send) {
      send({ action: "set_option", name, value: String(value) });
    }
  },

  sendEngineCommand: null,
  setEngineCommandDispatcher: (dispatcher) => set({ sendEngineCommand: dispatcher })
}));
