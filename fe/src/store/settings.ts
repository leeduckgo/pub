interface Settings {
  title: string;
  postsEndpoint: string;
  slogan: string;
  authProviders: string[];
  topicAddress: string;
  denyText: string;
  denyActionText: string;
  denyActionLink: string;
}

interface SettingsStore {
  isFetched: boolean;
  settings: Settings;
  setSettings: Function;
}

export function createSettingsStore() {
  return {
    settings: {
      title: '',
      postsEndpoint: '',
      slogan: '',
      authProviders: [],
      topicAddress: '',
      denyText: '',
      denyActionText: '',
      denyActionLink: '',
    },
    isFetched: false,
    setSettings(settings: Settings) {
      this.settings = settings;
    },
    setIsFetched(status: boolean) {
      this.isFetched = status;
    },
  } as SettingsStore;
}
