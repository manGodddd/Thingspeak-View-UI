import { ThingSpeakResponse } from '../types';

const BASE_URL = 'https://api.thingspeak.com/channels';

export const fetchChannelData = async (
  channelId: string, 
  readApiKey: string = '', 
  results: number = 50
): Promise<ThingSpeakResponse> => {
  if (!channelId) {
    throw new Error('Channel ID is required');
  }

  const params = new URLSearchParams({
    results: results.toString(),
  });

  if (readApiKey) {
    params.append('api_key', readApiKey);
  }

  const response = await fetch(`${BASE_URL}/${channelId}/feeds.json?${params.toString()}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Channel not found. Please check ID and visibility.');
    }
    throw new Error('Failed to fetch ThingSpeak data');
  }

  const data: ThingSpeakResponse = await response.json();
  return data;
};

export const fetchHistoryData = async (
  channelId: string,
  date: Date,
  readApiKey: string = ''
): Promise<ThingSpeakResponse> => {
  if (!channelId) throw new Error('Channel ID is required');

  // Format start and end for the entire day (00:00 to 23:59)
  const startStr = date.toISOString().split('T')[0] + ' 00:00:00';
  const endStr = date.toISOString().split('T')[0] + ' 23:59:59';

  const params = new URLSearchParams({
    start: startStr,
    end: endStr,
  });

  if (readApiKey) {
    params.append('api_key', readApiKey);
  }

  // Note: ThingSpeak takes time in the channel's timezone if not specified, 
  // but sending ISO-like strings often assumes UTC or server time. 
  // For simplicity in this lightweight app, we request by string range.
  const response = await fetch(`${BASE_URL}/${channelId}/feeds.json?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch history data');
  }

  return await response.json();
};