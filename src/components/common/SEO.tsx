import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
    title?: string;
    description?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogType?: 'website' | 'article' | 'profile';
    canonical?: string;
}

const DEFAULT_TITLE = 'OlyBars | The Nightlife OS';
const DEFAULT_DESC = 'OlyBars is the nightlife OS for Olympia — live happy hours, bar league, and real-time heatmap of downtown vibes.';
const DEFAULT_OG_IMAGE = 'https://olybars.com/og-image.png';

export const SEO: React.FC<SEOProps> = ({
    title,
    description,
    ogTitle,
    ogDescription,
    ogImage,
    ogType = 'website',
    canonical
}) => {
    const location = useLocation();
    const siteTitle = title ? `${title} | OlyBars` : DEFAULT_TITLE;
    const siteDesc = description || DEFAULT_DESC;

    useEffect(() => {
        // 1. Update Document Title
        document.title = siteTitle;

        // 2. Update Primary Meta Description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', siteDesc);
        } else {
            const meta = document.createElement('meta');
            meta.name = 'description';
            meta.content = siteDesc;
            document.head.appendChild(meta);
        }

        // 3. Update Open Graph Tags
        const ogTags = {
            'og:title': ogTitle || siteTitle,
            'og:description': ogDescription || siteDesc,
            'og:image': ogImage || DEFAULT_OG_IMAGE,
            'og:type': ogType,
            'og:url': `https://olybars.com${location.pathname}`,
        };

        Object.entries(ogTags).forEach(([property, content]) => {
            let element = document.querySelector(`meta[property="${property}"]`);
            if (element) {
                element.setAttribute('content', content);
            } else {
                const meta = document.createElement('meta');
                meta.setAttribute('property', property);
                meta.setAttribute('content', content);
                document.head.appendChild(meta);
            }
        });

        // 4. Update Canonical Link
        const canonicalUrl = canonical || `https://olybars.com${location.pathname}`;
        let linkElement = document.querySelector('link[rel="canonical"]');
        if (linkElement) {
            linkElement.setAttribute('href', canonicalUrl);
        } else {
            const link = document.createElement('link');
            link.rel = 'canonical';
            link.href = canonicalUrl;
            document.head.appendChild(link);
        }

    }, [siteTitle, siteDesc, ogTitle, ogDescription, ogImage, ogType, canonical, location.pathname]);

    return null; // This component doesn't render anything UI-wise
};
