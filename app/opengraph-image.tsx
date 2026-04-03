import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Vikranth Reddimasu — ML Engineer'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#090909',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#22c55e',
            }}
          />
          <span
            style={{
              fontSize: '16px',
              color: '#555555',
              letterSpacing: '4px',
              textTransform: 'uppercase' as const,
              fontFamily: 'monospace',
            }}
          >
            Open to work
          </span>
        </div>
        <h1
          style={{
            fontSize: '72px',
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.1,
            margin: 0,
            letterSpacing: '-2px',
          }}
        >
          Vikranth
          <br />
          Reddimasu
        </h1>
        <p
          style={{
            fontSize: '28px',
            color: '#555555',
            marginTop: '24px',
            lineHeight: 1.4,
          }}
        >
          ML Engineer building AI systems that scale.
        </p>
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            right: '80px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              fontSize: '16px',
              color: '#333333',
              fontFamily: 'monospace',
              letterSpacing: '2px',
            }}
          >
            vikranthreddimasu.xyz
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
