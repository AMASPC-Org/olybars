export interface MerchItem {
    id: string;
    venueId: string;
    name: string;
    description: string;
    price: number;
    imageURL: string;
    category: 'T-Shirt' | 'Hoodie' | 'Hat' | 'Other';
    sizes?: string[];
}
