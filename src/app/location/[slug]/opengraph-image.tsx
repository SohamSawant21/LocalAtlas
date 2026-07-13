import { ImageResponse } from 'next/og';
import { getLocationBySlug } from '@/services/location';

export const alt = 'Location Preview';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const location = await getLocationBySlug(slug);

  if (!location) {
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff', fontSize: 64, fontWeight: 'bold' }}>
          LocalAtlas
        </div>
      )
    );
  }

  // Ensure we have a valid image URL for the background
  const bgImage = location.images && location.images.length > 0 ? location.images[0] : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#18181b', // fallback background color
          position: 'relative',
        }}
      >
        {/* Background Image (img tag is required in satori for external URLs instead of backgroundImage) */}
        {bgImage && (
          <img
            src={bgImage}
            alt="background"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.4,
            }}
          />
        )}
        
        {/* Content Wrapper */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            color: 'white',
            textAlign: 'center',
            padding: '40px',
          }}
        >
          <div
            style={{
              fontSize: '32px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '4px',
              color: '#38bdf8',
              marginBottom: '24px',
            }}
          >
            LocalAtlas
          </div>
          <div
            style={{
              fontSize: '72px',
              fontWeight: 900,
              marginBottom: '24px',
              maxWidth: '900px',
              lineHeight: 1.1,
            }}
          >
            {location.name}
          </div>
          <div
            style={{
              fontSize: '36px',
              fontWeight: 500,
              color: '#e2e8f0',
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
            }}
          >
            <span>{location.category.replace('_', ' ')}</span>
            <span style={{ color: '#94a3b8' }}>•</span>
            <span>{location.district}</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
