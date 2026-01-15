import { MerchItem } from '../types.js';

export const MERCH_ITEMS: MerchItem[] = [
    {
        id: 'brotherhood-hoodie',
        venueId: 'brotherhood',
        name: 'The Brotherhood Hoodie',
        description: "The iconic heavy-weight black hoodie. Perfect for rainy Oly nights and pretending you’re a local legend. 'The Bro' label signifies you know exactly where the best pool table in town is.",
        price: 45,
        imageURL: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600',
        category: 'Hoodie',
        sizes: ['S', 'M', 'L', 'XL', 'XXL']
    },
    {
        id: 'well80-tee',
        venueId: 'well80',
        name: 'Well 80 Original Tee',
        description: "Soft-touch navy tee featuring the Artesian well logo. Water might be free, but this drip isn’t. Show off your love for the 1896 aquifer in style.",
        price: 25,
        imageURL: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600',
        category: 'T-Shirt',
        sizes: ['S', 'M', 'L', 'XL']
    },
    {
        id: 'threemags-hat',
        venueId: 'threemagnets',
        name: '3 Mags Trucker Hat',
        description: "Stay clear-headed with this structured trucker hat. The perfect companion for a 'Self Care' non-alcoholic beer or a crisp hazy IPA.",
        price: 30,
        imageURL: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=600',
        category: 'Hat',
        sizes: ['One Size']
    }
];
