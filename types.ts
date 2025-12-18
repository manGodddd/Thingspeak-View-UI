export interface ThingSpeakChannel {
  id: number;
  name: string;
  description: string;
  latitude: string;
  longitude: string;
  field1?: string;
  field2?: string;
  field3?: string;
  field4?: string;
  field5?: string;
  field6?: string;
  field7?: string;
  field8?: string;
  created_at: string;
  updated_at: string;
  last_entry_id: number;
}

export interface ThingSpeakFeed {
  created_at: string;
  entry_id: number;
  field1?: string | null;
  field2?: string | null;
  field3?: string | null;
  field4?: string | null;
  field5?: string | null;
  field6?: string | null;
  field7?: string | null;
  field8?: string | null;
}

export interface ThingSpeakResponse {
  channel: ThingSpeakChannel;
  feeds: ThingSpeakFeed[];
}

export interface WidgetConfig {
  id: string;
  fieldKey: keyof ThingSpeakFeed; // e.g., 'field1'
  label: string;
  type: 'line' | 'area' | 'bar' | 'stat';
  color: string;
  unit: string;
  visible: boolean;
}

export interface AppConfig {
  channelId: string;
  readApiKey: string;
  refreshRate: number; // in seconds
}