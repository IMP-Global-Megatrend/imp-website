'use client'

import { useEffect, useRef } from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'

const ZURICH_COORDINATES: [number, number] = [8.5417, 47.3692]
const PRIMARY_BLUE = '#2b3dea'

export function ContactLocationMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let isMounted = true
    let map: import('maplibre-gl').Map | null = null
    let marker: import('maplibre-gl').Marker | null = null

    const initializeMap = async () => {
      const maplibregl = (await import('maplibre-gl')).default
      if (!isMounted || !mapContainerRef.current) return

      map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: ZURICH_COORDINATES,
        zoom: 16,
        pitch: 58,
        bearing: -18,
        attributionControl: false,
      })

      map.on('styleimagemissing', ({ id }) => {
        if (!map || map.hasImage(id)) return

        // Avoid noisy missing-sprite warnings for POI icon IDs from third-party styles.
        map.addImage(id, {
          width: 1,
          height: 1,
          data: new Uint8Array([0, 0, 0, 0]),
        })
      })

      const markerElement = document.createElement('div')
      markerElement.className = 'h-[41px] w-[27px]'
      markerElement.innerHTML = `
        <svg display="block" height="41" width="27" viewBox="0 0 27 41" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            fill="${PRIMARY_BLUE}"
            d="M13.5 0C6.044 0 0 6.044 0 13.5C0 20.956 13.5 41 13.5 41C13.5 41 27 20.956 27 13.5C27 6.044 20.956 0 13.5 0Z"
          />
          <g transform="translate(6.8 6.4) scale(0.5)">
            <path
              fill="#ffffff"
              d="M16.091 28C22.668 28 28 22.668 28 16.091c0-6.576-5.332-11.908-11.909-11.908-6.576 0-11.908 5.332-11.908 11.908C4.183 22.668 9.515 28 16.09 28"
            />
            <path
              fill="#ffffff"
              d="M4.708 27.474c-6.274-6.274-6.274-16.48 0-22.765A15.97 15.97 0 0 1 16.091 0c4.309 0 8.343 1.669 11.383 4.709L25.863 6.32C20.468.949 11.703.949 6.32 6.331s-5.383 14.149 0 19.532z"
            />
          </g>
        </svg>
      `

      marker = new maplibregl.Marker({
        element: markerElement,
        anchor: 'bottom',
      })
        .setLngLat(ZURICH_COORDINATES)
        .addTo(map)
    }

    void initializeMap()

    return () => {
      isMounted = false
      marker?.remove()
      map?.remove()
    }
  }, [])

  return (
    <div className="overflow-hidden">
      <div ref={mapContainerRef} className="h-[360px] w-full bg-[#eef2ff]" />
    </div>
  )
}
