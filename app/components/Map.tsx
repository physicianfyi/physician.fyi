import { Link } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import type { GeoJSONSource, LayerProps, MapRef } from "react-map-gl";
import MapGL, { Layer, Popup, Source } from "react-map-gl";

function useMediaQuery(query: string): boolean {
  const getMatches = (query: string): boolean => {
    // Prevents SSR issues
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState<boolean>(getMatches(query));

  function handleChange() {
    setMatches(getMatches(query));
  }

  useEffect(() => {
    const matchMedia = window.matchMedia(query);

    // Triggered at the first client-side load and if query changes
    handleChange();

    // Listen matchMedia
    if (matchMedia.addListener) {
      matchMedia.addListener(handleChange);
    } else {
      matchMedia.addEventListener("change", handleChange);
    }

    return () => {
      if (matchMedia.removeListener) {
        matchMedia.removeListener(handleChange);
      } else {
        matchMedia.removeEventListener("change", handleChange);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return matches;
}

const clusterLayer: LayerProps = {
  id: "clusters",
  type: "circle",
  source: "disciplines",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": [
      "step",
      ["get", "point_count"],
      "#51bbd6",
      100,
      "#f1f075",
      750,
      "#f28cb1",
    ],
    "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
  },
};

const clusterCountLayer: LayerProps = {
  id: "cluster-count",
  type: "symbol",
  source: "disciplines",
  filter: ["has", "point_count"],
  layout: {
    "text-field": "{point_count_abbreviated}",
    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
    "text-size": 12,
  },
};

const unclusteredPointLayer: LayerProps = {
  id: "unclustered-point",
  type: "circle",
  source: "disciplines",
  filter: ["!", ["has", "point_count"]],
  paint: {
    "circle-color": "#11b4da",
    "circle-radius": 4,
    "circle-stroke-width": 1,
    "circle-stroke-color": "#fff",
  },
};

export const Map = ({ data }: any) => {
  const isDark = useMediaQuery("(prefers-color-scheme: dark)");
  const mapRef = useRef<MapRef>(null);
  const [popupInfo, setPopupInfo] = useState<{
    lngLat: [number, number];
    results: any;
  } | null>(null);

  const onClick = (event: any) => {
    const feature = event.features[0];
    if (!feature) return;

    if (feature.layer.id === "unclustered-point") {
      // Fix for weird issue where clicking another dot while a popup is open breaks it from then on. Need to close one and then click another for it to keep working
      if (popupInfo) {
        setPopupInfo(null);
      } else {
        const results = [feature.properties];
        for (let i = 1; i < event.features.length; i++) {
          const coords = event.features[i].geometry.coordinates;
          if (
            coords[0] === feature.geometry.coordinates[0] &&
            coords[1] === feature.geometry.coordinates[1] &&
            !results.find((r) => r.id === event.features[i].properties.id)
          ) {
            results.push(event.features[i].properties);
          }
        }
        setPopupInfo({
          lngLat: feature.geometry.coordinates,
          results,
        });
      }
    } else {
      const clusterId = feature.properties.cluster_id;

      const mapboxSource = mapRef.current?.getSource(
        "disciplines"
      ) as GeoJSONSource;

      mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) {
          return;
        }

        mapRef.current?.easeTo({
          center: feature.geometry.coordinates,
          zoom,
          duration: 250,
        });
      });
    }

    // TODO
    // map.on('click', 'unclustered-point', (e) => {
    //   const coordinates = e.features[0].geometry.coordinates.slice();
    //   const mag = e.features[0].properties.mag;
    //   const tsunami =
    //   e.features[0].properties.tsunami === 1 ? 'yes' : 'no';

    //   // Ensure that if the map is zoomed out such that
    //   // multiple copies of the feature are visible, the
    //   // popup appears over the copy being pointed to.
    //   while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    //   coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    //   }

    //   new mapboxgl.Popup()
    //   .setLngLat(coordinates)
    //   .setHTML(
    //   `magnitude: ${mag}<br>Was there a tsunami?: ${tsunami}`
    //   )
    //   .addTo(map);
    //   });

    //   map.on('mouseenter', 'clusters', () => {
    //   map.getCanvas().style.cursor = 'pointer';
    //   });
    //   map.on('mouseleave', 'clusters', () => {
    //   map.getCanvas().style.cursor = '';
    //   });
  };

  return (
    <MapGL
      mapLib={import("mapbox-gl")}
      initialViewState={{
        longitude: -100,
        latitude: 40,
        zoom: 2.5,
      }}
      onClick={onClick}
      ref={mapRef}
      style={{ width: "100%", height: 400 }}
      mapStyle={
        isDark
          ? "mapbox://styles/mapbox/dark-v11"
          : "mapbox://styles/mapbox/light-v11"
      }
      interactiveLayerIds={[
        clusterLayer.id as string,
        unclusteredPointLayer.id as string,
      ]}
      mapboxAccessToken="pk.eyJ1IjoicGh5c2ljaWFuZnlpIiwiYSI6ImNsbmk4ZXB1djFha2kybHBkcDRicmZvNHgifQ.iEXcoDG8yBi23d_chOU8xQ"
    >
      <Source
        id="disciplines"
        type="geojson"
        data={data}
        cluster={true}
        clusterMaxZoom={14}
        clusterRadius={50}
      >
        <Layer {...clusterLayer} />
        <Layer {...clusterCountLayer} />
        <Layer {...unclusteredPointLayer} />
      </Source>

      {popupInfo && (
        <Popup
          // tipSize={5}
          longitude={popupInfo.lngLat[0]}
          latitude={popupInfo.lngLat[1]}
          onClose={() => setPopupInfo(null)}
          // Content needs to be styled in stylesheet class selector
          // className="popover"
          // closeButton={false}
          // TODO Figure out how to make scrollable on overflow
        >
          <ul className="flex flex-col gap-2 last:[&>hr]:last:[&>li]:hidden">
            {popupInfo.results.map((r: any) => {
              return (
                <li key={r.id}>
                  <Link to={`/${r.state}/${r.id}`} className="uppercase">
                    {r.name}
                  </Link>
                  <div className="uppercase">
                    <span className="uppercase">{r.state}</span> {r.id}
                  </div>
                  <div>{r.numActions} actions</div>

                  <hr className="h-px mt-2 bg-gray-200 border-0 dark:bg-gray-700" />
                </li>
              );
            })}
          </ul>
        </Popup>
      )}
    </MapGL>
  );
};
