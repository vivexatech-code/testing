import { MetadataRoute } from 'next';
import { collection, getDocs } from 'firebase/firestore';
import { hasFirebaseWebConfig } from '@/lib/firebase/client';
import { getDb } from '@/lib/firebase/firestore';

const BASE_URL = 'https://www.repairseries.in';

// YAHAN EXPORT DEFAULT LIKHNA ZAROORI HAI 👇
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/services',
    '/categories',
    '/terms',
    '/privacy-policy',
    '/refund'
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    if (!hasFirebaseWebConfig()) return staticRoutes;

    const db = getDb();
    
    if (!db) return staticRoutes;

    const servicesCol = collection(db, 'services');
    const servicesSnapshot = await getDocs(servicesCol);
    
    const dynamicServices = servicesSnapshot.docs.map((doc) => {
      const data = doc.data();
      const slug = data.slug || doc.id; 
      
      return {
        url: `${BASE_URL}/services/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      };
    });

    const categoriesCol = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesCol);
    
    const dynamicCategories = categoriesSnapshot.docs.map((doc) => {
      const data = doc.data();
      const slug = data.slug || doc.id;
      
      return {
        url: `${BASE_URL}/categories/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      };
    });

    return [...staticRoutes, ...dynamicCategories, ...dynamicServices];

  } catch {
    return staticRoutes;
  }
}