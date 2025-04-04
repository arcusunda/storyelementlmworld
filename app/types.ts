export interface Attribute {
    trait_type: string;
    value: string;
  }
  
  export interface StoryElement {
    id: number;
    name: string;
    description: string;
    image: string;
    aspect: string;
    attributes?: Attribute[];
    author: string;
    address: string;
    created: Date;
    updated?: Date;
    version: number;
    tokenId: number;
  }
  