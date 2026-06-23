export const LOCAL_DATA_KEYS = [
  'pitchtimer_language',
  'pitchtimer_time_mode',
  'pitchtimer_notes',
  'pitchtimer_notes_title',
  'pitchtimer_prompter_font_scale',
  'pitchtimer_history',
] as const;

export function clearAllLocalData() {
  for (const key of LOCAL_DATA_KEYS) {
    localStorage.removeItem(key);
  }
}
