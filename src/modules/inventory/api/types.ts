export enum StorageLocation {
  PANTRY = 'pantry',
  FRIDGE = 'fridge',
  FREEZER = 'freezer',
  OTHER = 'other',
}

export enum FreshnessStatus {
  FRESH = 'fresh',
  EXPIRING_SOON = 'expiring_soon',
  EXPIRED = 'expired',
}

export enum WasteType {
  WET = 'wet_waste',
  DRY = 'dry_waste',
  HAZARDOUS = 'hazardous',
}

export enum DiscardReason {
  EXPIRED = 'expired',
  SPOILED = 'spoiled',
  LEFTOVER = 'leftover',
  UNUSED = 'unused',
  COOKED = 'cooked',
}

export enum InventoryItemSource {
  MANUAL = 'manual',
  VOICE = 'voice',
  SHOPPING_LIST = 'shopping_list',
  RECIPE = 'recipe',
}


export interface InventoryIngredient {
  _id: string;
  name: string;
  heroImageUrl?: string;
  theme?: string;
  categoryId?: string;
}

export interface InventoryItem {
  _id: string;
  userId: string;
  ingredientId?: InventoryIngredient | string;
  name: string;
  quantity: number;
  unit: string;
  storageLocation: StorageLocation;
  freshnessStatus: FreshnessStatus;
  expiresAt?: string;
  addedAt: string;
  source: InventoryItemSource;
  isDiscarded: boolean;
  wasteType?: WasteType;
  discardReason?: DiscardReason;
  discardNotes?: string;
  discardedAt?: string;
  discardedQuantity?: number;
  heroImageUrl?: string;
  categoryId?: string;
  isStaple: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryGroupedResponse {
  pantry: InventoryItem[];
  fridge: InventoryItem[];
  freezer: InventoryItem[];
  other: InventoryItem[];
  summary: {
    total: number;
    expiringSoon: number;
    expired: number;
  };
}


export interface AddInventoryItemDto {
  ingredientId?: string;
  name: string;
  quantity: number;
  unit: string;
  storageLocation?: StorageLocation;
  expiresAt?: string;
  source?: InventoryItemSource;
  heroImageUrl?: string;
  categoryId?: string;
  isStaple?: boolean;
  country?: string;
}

export interface BatchAddInventoryItemsDto {
  items: AddInventoryItemDto[];
}

export interface UpdateInventoryItemDto {
  name?: string;
  quantity?: number;
  unit?: string;
  storageLocation?: StorageLocation;
  expiresAt?: string;
  isStaple?: boolean;
}

export interface DiscardInventoryItemDto {
  itemId: string;
  reason: DiscardReason;
  wasteType: WasteType;
  discardedQuantity?: number;
  notes?: string;
  addToShoppingList?: boolean;
}

export interface VoiceAddInventoryDto {
  transcript: string;
}

export interface ParsedVoiceItem {
  ingredientId?: string;
  name: string;
  quantity: number;
  unit: string;
  storageLocation: StorageLocation;
  expiryDays: number;
  expiresAt: string;
  confidence: number;
  source: InventoryItemSource;
}

export interface VoiceParseResponse {
  transcript: string;
  parsedItems: ParsedVoiceItem[];
}

export interface MealSuggestion {
  recipe: {
    _id: string;
    title: string;
    shortDescription?: string;
    heroImageUrl?: string;
    prepCookTime?: string;
    portions?: number;
  };
  matchedIngredients: string[];
  missingIngredients: string[];
  matchPercentage: number;
  expiringIngredientsUsed: string[];
  aiReason?: string;
}

export interface WasteAnalytics {
  totalDiscarded: number;
  byWasteType: Record<string, number>;
  byReason: Record<string, number>;
  byMonth: { month: string; count: number; quantity: number }[];
  topWastedItems: { name: string; count: number; totalQuantity: number }[];
}

export interface WasteClassification {
  wasteType: WasteType;
  confidence: number;
  disposalTip: string;
}

export interface NewRecipeMatchesResponse {
  hasNewMatches: boolean;
  newMatchCount: number;
  topNewMatch: MealSuggestion | null;
  newMatches: MealSuggestion[];
}

export interface GetInventoryQueryParams {
  storageLocation?: StorageLocation;
  freshnessStatus?: FreshnessStatus;
  search?: string;
  expiringWithinDays?: number;
}
