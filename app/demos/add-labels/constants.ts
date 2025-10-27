export const LABEL_COLORS: Record<string, string> = {
  PERSON: 'bg-blue-200 dark:bg-blue-900/40 border-blue-400',
  ORGANIZATION: 'bg-green-200 dark:bg-green-900/40 border-green-400',
  LOCATION: 'bg-purple-200 dark:bg-purple-900/40 border-purple-400',
  DATE: 'bg-orange-200 dark:bg-orange-900/40 border-orange-400',
  CUSTOM: 'bg-pink-200 dark:bg-pink-900/40 border-pink-400',
};

export const SUGGESTED_LABELS = ['PERSON', 'ORGANIZATION', 'LOCATION', 'DATE'];

export const POPUP_OFFSET_Y = 60; // pixels above selection

export const SAMPLE_TEXT = `The Beatles were an English rock band formed in Liverpool in 1960. The core lineup of the band comprised John Lennon, Paul McCartney, George Harrison and Ringo Starr. They are widely regarded as the most influential band in Western popular music and were integral to the development of 1960s counterculture and the recognition of popular music as an art form. Rooted in skiffle, beat and 1950s rock 'n' roll, their sound incorporated elements of classical music and traditional pop in innovative ways. The band also explored music styles ranging from folk and Indian music to psychedelia and hard rock. As pioneers in recording, songwriting and artistic presentation, the Beatles revolutionised many aspects of the music industry and were often publicised as leaders of the era's youth and sociocultural movements.`;

export const SESSION_STORAGE_KEY = 'text-labels';
