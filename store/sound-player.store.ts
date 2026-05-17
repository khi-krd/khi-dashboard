import { create } from "zustand"

export type SoundPlayerTrack = {
  trackId: number
  fileId?: number
  src: string
  title: string
  subtitle?: string
}

type SoundPlayerState = {
  current: SoundPlayerTrack | null
  isPlaying: boolean
  currentTime: number
  duration: number
  audioEl: HTMLAudioElement | null
}

type SoundPlayerActions = {
  setAudioEl: (el: HTMLAudioElement | null) => void
  play: (track: SoundPlayerTrack) => void
  pause: () => void
  toggle: () => void
  seek: (time: number) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  stop: () => void
}

export const useSoundPlayer = create<SoundPlayerState & SoundPlayerActions>(
  (set, get) => ({
    current: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    audioEl: null,

    setAudioEl: (el) => set({ audioEl: el }),

    play: (track) => {
      const { audioEl, current } = get()
      const same =
        current?.trackId === track.trackId &&
        current?.fileId === track.fileId &&
        current?.src === track.src

      set({ current: track, isPlaying: true })

      if (audioEl) {
        if (!same || audioEl.src !== track.src) {
          audioEl.src = track.src
          audioEl.load()
        }
        void audioEl.play().catch(() => {
          set({ isPlaying: false })
        })
      }
    },

    pause: () => {
      const { audioEl } = get()
      audioEl?.pause()
      set({ isPlaying: false })
    },

    toggle: () => {
      const { isPlaying, play, pause, current } = get()
      if (!current) return
      if (isPlaying) pause()
      else play(current)
    },

    seek: (time) => {
      const { audioEl } = get()
      if (audioEl) {
        audioEl.currentTime = time
      }
      set({ currentTime: time })
    },

    setCurrentTime: (time) => set({ currentTime: time }),

    setDuration: (duration) => set({ duration }),

    stop: () => {
      const { audioEl } = get()
      if (audioEl) {
        audioEl.pause()
        audioEl.src = ""
      }
      set({
        current: null,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
      })
    },
  }),
)
