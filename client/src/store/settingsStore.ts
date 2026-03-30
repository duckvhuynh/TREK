import { create } from 'zustand'
import { settingsApi } from '../api/client'
import type { Settings } from '../types'
import { getApiErrorMessage } from '../types'

interface SettingsState {
  settings: Settings
  isLoaded: boolean

  loadSettings: () => Promise<void>
  updateSetting: (key: keyof Settings, value: Settings[keyof Settings]) => Promise<void>
  setLanguageLocal: (lang: string) => void
  updateSettings: (settingsObj: Partial<Settings>) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {
    map_tile_url: '',
    default_lat: 16.05147105450093,
    default_lng: 108.21092171511256,
    default_zoom: 10,
    dark_mode: false,
    default_currency: 'VND',
    language: localStorage.getItem('app_language') || 'en',
    temperature_unit: 'celsius',
    time_format: '24h',
    show_place_description: false,
  },
  isLoaded: false,

  loadSettings: async () => {
    try {
      const data = await settingsApi.get()
      set((state) => ({
        settings: { ...state.settings, ...data.settings },
        isLoaded: true,
      }))
    } catch (err: unknown) {
      set({ isLoaded: true })
      console.error('Failed to load settings:', err)
    }
  },

  updateSetting: async (key: keyof Settings, value: Settings[keyof Settings]) => {
    set((state) => ({
      settings: { ...state.settings, [key]: value },
    }))
    if (key === 'language') localStorage.setItem('app_language', value as string)
    try {
      await settingsApi.set(key, value)
    } catch (err: unknown) {
      console.error('Failed to save setting:', err)
      throw new Error(getApiErrorMessage(err, 'Error saving setting'))
    }
  },

  setLanguageLocal: (lang: string) => {
    localStorage.setItem('app_language', lang)
    set((state) => ({ settings: { ...state.settings, language: lang } }))
  },

  updateSettings: async (settingsObj: Partial<Settings>) => {
    set((state) => ({
      settings: { ...state.settings, ...settingsObj },
    }))
    try {
      await settingsApi.setBulk(settingsObj)
    } catch (err: unknown) {
      console.error('Failed to save settings:', err)
      throw new Error(getApiErrorMessage(err, 'Error saving settings'))
    }
  },
}))
