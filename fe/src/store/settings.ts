interface Settings {
  topicAddress: string,
  denyText: string,
  denyActionText: string,
  denyActionLink: string,
}

interface SettingsStore {
  isFetched: boolean;
  settings: Settings;
  setSettings: Function;
}

export function createSettingsStore() {
  return {
    settings: {
      topicAddress: '',
      denyText: '',
      denyActionText: '',
      denyActionLink: '',
    },
    isFetched: false,
    setSettings(settings: Settings) {
      this.settings = settings;
      this.isFetched = true;
    },
  } as SettingsStore;
}
