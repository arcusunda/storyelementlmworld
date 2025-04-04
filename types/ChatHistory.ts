export interface ChatHistoryDocument {
    tokenId: number;
    userMessage: string;
    aiResponse: string;
    nftContext: object;
    createdAt: Date;
  }