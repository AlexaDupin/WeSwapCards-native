export interface CardItemData {
    id: number;
    name: string;
    number: number;
    place_id: number;
}

export type CardStatus = 'default' | 'owned' | 'duplicated';
