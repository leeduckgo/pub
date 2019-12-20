export function createSettingsStore() {
  return {
    settings: {},
    isFetched: false,
    setSettings(settings: any = {}) {
      this.settings = settings;
    },
    setIsFetched(status: boolean) {
      this.isFetched = status;
    },
  };
}
