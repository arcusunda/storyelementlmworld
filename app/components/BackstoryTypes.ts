// /app/components/BackstoryTypes.ts
export interface BackstoryOption {
    id: string;
    name: string;
    description: string;
  }
  
  export interface BackstoryCategoryOption {
    id: string;
    name: string;
    description: string;
    options: BackstoryOption[];
  }
  
  export const BACKSTORY_CATEGORIES: BackstoryCategoryOption[] = [
    {
      id: "origin",
      name: "Origin Stories",
      description: "How they came to The Violet Reaches",
      options: [
        {
          id: "heroicSacrifice",
          name: "Heroic Sacrifice",
          description: "Died protecting someone or something they loved"
        },
        {
          id: "tragicAccident",
          name: "Tragic Accident",
          description: "Unexpected, sudden passing that left unfinished business"
        },
        {
          id: "peacefulTransition",
          name: "Peaceful Transition",
          description: "A natural end after a fulfilled life, but still with lingering connections"
        },
        {
          id: "mysteriousDisappearance",
          name: "Mysterious Disappearance",
          description: "Vanished under unexplained circumstances, now exploring the in-between"
        }
      ]
    },
    {
      id: "purpose",
      name: "Life's Purpose",
      description: "Their driving motivation",
      options: [
        {
          id: "artistCreator",
          name: "Artist/Creator",
          description: "Seeking to leave a lasting legacy through creative expression"
        },
        {
          id: "guardianProtector",
          name: "Guardian/Protector",
          description: "Driven to watch over loved ones or sacred places"
        },
        {
          id: "explorerAdventurer",
          name: "Explorer/Adventurer",
          description: "Motivated by discovery and new experiences"
        },
        {
          id: "healerNurturer",
          name: "Healer/Nurturer",
          description: "Finding purpose in mending wounds and nurturing growth"
        },
        {
          id: "scholarSeeker",
          name: "Scholar/Seeker",
          description: "Searching for hidden knowledge and universal truths"
        }
      ]
    },
    {
      id: "emotional",
      name: "Emotional Journey",
      description: "The heart of their story",
      options: [
        {
          id: "seekingRedemption",
          name: "Seeking Redemption",
          description: "Trying to right past wrongs or find forgiveness"
        },
        {
          id: "lostConnection",
          name: "Lost Connection",
          description: "Looking to reconnect with someone they were separated from"
        },
        {
          id: "unfulfilledPromise",
          name: "Unfulfilled Promise",
          description: "Bound by a vow or promise yet to be completed"
        },
        {
          id: "unsolvedMystery",
          name: "Unsolved Mystery",
          description: "Driven to uncover a truth or secret from their past"
        }
      ]
    },
    {
      id: "relationship",
      name: "Relationship to The Violet Reaches",
      description: "Their place in this realm",
      options: [
        {
          id: "ancestralGuardian",
          name: "Ancestral Guardian",
          description: "Connected to this place through generations of family"
        },
        {
          id: "accidentalWanderer",
          name: "Accidental Wanderer",
          description: "Stumbled upon this realm by chance"
        },
        {
          id: "chosenOne",
          name: "Chosen One",
          description: "Specifically called to this realm for a greater purpose"
        },
        {
          id: "nativeSpirit",
          name: "Native Spirit",
          description: "Has always belonged to this mystical dimension"
        }
      ]
    },
    {
      id: "archetype",
      name: "Character Archetype",
      description: "Their core personality",
      options: [
        {
          id: "rebel",
          name: "The Rebel",
          description: "Challenges traditions and established order"
        },
        {
          id: "mentor",
          name: "The Mentor",
          description: "Guides others with wisdom and experience"
        },
        {
          id: "innocent",
          name: "The Innocent",
          description: "Brings fresh perspective and uncorrupted viewpoint"
        },
        {
          id: "trickster",
          name: "The Trickster",
          description: "Uses wit and cleverness to navigate challenges"
        },
        {
          id: "caregiver",
          name: "The Caregiver",
          description: "Places others' needs before their own"
        }
      ]
    }
  ];
  
  export const findBackstoryOptionById = (categoryId: string, optionId: string): BackstoryOption | null => {
    const category = BACKSTORY_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return null;
    
    return category.options.find(o => o.id === optionId) || null;
  };
  
  export interface BackstoryChoices {
    origin?: string;
    purpose?: string;
    emotional?: string;
    relationship?: string;
    archetype?: string;
    isRandom: boolean;
  }
  
  export const DEFAULT_BACKSTORY_CHOICES: BackstoryChoices = {
    isRandom: true
  };