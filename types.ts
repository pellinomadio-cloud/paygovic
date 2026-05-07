
export interface Country {
  name: string;
  code: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
