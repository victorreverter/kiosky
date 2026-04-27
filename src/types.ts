export type TabColor = 
  | 'blue'
  | 'green'
  | 'purple'
  | 'red'
  | 'orange'
  | 'pink'
  | 'gray';

export interface TabGroup {
  id: string;
  name: string;
  color: TabColor;
  icon: string;
  createdAt: number;
  isDefault?: boolean;
}

export interface Source {
  id: string;
  name: string;
  url: string;
  addedAt: number;
  tabId: string;
}
