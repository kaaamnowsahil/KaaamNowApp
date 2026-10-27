import { useCallback, useEffect, useMemo, useState, type FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { LEAFLET_CSS, LEAFLET_JS } from '@/assets/leaflet/leafletSource';
import { FONTS } from '@/constants/fonts';
import { tr } from '@/services/i18n/tr';
import {
  getDevicePosition,
  type DevicePosition,
} from '@/services/maps/devicePosition';
import { useTheme } from '@/theme/ThemeProvider';

/** The package's default generic (`undefined`) collapses every prop to `never`. */
const MapWebView = WebView<object>;

export type ShiftRoute = { durationMinutes: number; distanceKm: number };

type RouteState = {
  origin: DevicePosition | null;
  path: [number, number][];
};

const k = (key: string) => tr(`shiftRouteMap.${key}`);

const STRINGS = {
  get LOADING() {
    return k('loading');
  },
  get NO_LOCATION() {
    return k('noLocation');
  },
  get NO_ROUTE() {
    return k('noRoute');
  },
  get RETRY() {
    return k('retry');
  },
};

const inlineScript = (source: string) =>
  source.replace(/<\/script/gi, '<\\/script');

const buildHtml = (
  target: DevicePosition,
  route: RouteState | null,
  routeColor: string,
) => `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<style>${LEAFLET_CSS}</style>
<style>html,body,#map{margin:0;padding:0;height:100%;width:100%;}
.dot{border-radius:50%;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);}
.dot-current{background:#2563eb;}.dot-target{background:#ef4444;}</style>
</head><body><div id="map"></div>
<script>${inlineScript(LEAFLET_JS)}</script>
<script>
var target = ${JSON.stringify(target)};
var origin = ${JSON.stringify(route?.origin ?? null)};
var path = ${JSON.stringify(route?.path ?? [])};
var map = L.map('map').setView([target.latitude, target.longitude], 15);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
function dot(kind) {
  return L.divIcon({ className: 'dot dot-' + kind, iconSize: [16, 16], iconAnchor: [8, 8] });
}
if (path.length) L.polyline(path, { color: '${routeColor}', weight: 5 }).addTo(map);
L.marker([target.latitude, target.longitude], { icon: dot('target') }).addTo(map);
if (origin) {
  L.marker([origin.latitude, origin.longitude], { icon: dot('current') }).addTo(map);
  map.fitBounds([[origin.latitude, origin.longitude], [target.latitude, target.longitude]],
    { padding: [24, 24], maxZoom: 15 });
}
</script></body></html>`;

type OsrmResult = {
  code: string;
  routes?: {
    distance: number;
    duration: number;
    geometry: { coordinates: [number, number][] };
  }[];
};

const fetchRoute = async (from: DevicePosition, to: DevicePosition) => {
  const path = `${from.longitude},${from.latitude};${to.longitude},${to.latitude}`;
  const response = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${path}?overview=full&geometries=geojson&steps=false`,
  );
  if (!response.ok) throw new Error(STRINGS.NO_ROUTE);
  const result = (await response.json()) as OsrmResult;
  const route = result.routes?.[0];
  if (result.code !== 'Ok' || !route?.geometry.coordinates.length)
    throw new Error(STRINGS.NO_ROUTE);
  return route;
};

/** Same OpenStreetMap + OSRM route map as web: your location, the shift pin and the driving route. */
export const ShiftRouteMap: FC<{
  destination: DevicePosition | null;
  onRoute?: (route: ShiftRoute) => void;
  height?: number;
}> = ({ destination, onRoute, height = 196 }) => {
  const { colors } = useTheme();
  const [route, setRoute] = useState<RouteState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const latitude = destination?.latitude;
  const longitude = destination?.longitude;

  const load = useCallback(async () => {
    if (latitude == null || longitude == null) return;
    setBusy(true);
    setError('');
    try {
      const origin = await getDevicePosition();
      if (!origin) throw new Error(STRINGS.NO_LOCATION);
      const result = await fetchRoute(origin, { latitude, longitude });
      setRoute({
        origin,
        path: result.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
      });
      onRoute?.({
        durationMinutes: Math.max(1, Math.round(result.duration / 60)),
        distanceKm: Math.round(result.distance / 100) / 10,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : STRINGS.NO_ROUTE);
    } finally {
      setBusy(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);

  useEffect(() => {
    load();
  }, [load]);

  const html = useMemo(
    () =>
      latitude == null || longitude == null
        ? null
        : buildHtml({ latitude, longitude }, route, colors.primary),
    [latitude, longitude, route, colors.primary],
  );

  return (
    <View style={styles.root}>
      {busy ? (
        <Text style={[styles.note, { color: colors.textSubtle }]}>
          {STRINGS.LOADING}
        </Text>
      ) : null}
      {error ? (
        <Text
          style={[styles.note, { color: colors.danger }]}
          accessibilityRole="alert"
        >
          {error}
        </Text>
      ) : null}
      {html ? (
        <View style={[styles.map, { height, borderColor: colors.border }]}>
          <MapWebView
            originWhitelist={['*']}
            source={{ html, baseUrl: 'https://kaaamnow.app' }}
            style={styles.webView}
            nestedScrollEnabled
            scrollEnabled={false}
            javaScriptEnabled
            testID="shift-route-map"
          />
        </View>
      ) : null}
      {error && !busy ? (
        <Pressable
          accessibilityRole="button"
          onPress={load}
          style={[styles.retry, { borderColor: colors.primary }]}
        >
          <Text style={[styles.retryText, { color: colors.primary }]}>
            {STRINGS.RETRY}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { gap: 8 },
  note: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 17 },
  map: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  /** Android WebView paints blank inside a clipped, rounded parent at opacity 1. */
  webView: { flex: 1, opacity: 0.99 },
  retry: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
  },
  retryText: { fontFamily: FONTS.semiBold, fontSize: 13 },
});
