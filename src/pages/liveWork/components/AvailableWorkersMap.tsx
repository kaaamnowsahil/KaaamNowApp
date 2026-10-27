import { useEffect, useMemo, useRef, type FC } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { LEAFLET_CSS, LEAFLET_JS } from '@/assets/leaflet/leafletSource';
import type { LiveWorkerDot } from '@/services/liveWork/liveWorkTypes';
import { useTheme } from '@/theme/ThemeProvider';

/** The package's default generic (`undefined`) collapses every prop to `never`. */
const MapWebView = WebView<object>;
type MapWebViewRef = WebView<object>;

export type AvailableWorkersMapData = {
  latitude: number;
  longitude: number;
  radiusKm: number;
  workers: LiveWorkerDot[];
};

type AvailableWorkersMapProps = AvailableWorkersMapData & { label: string };

const inlineScript = (source: string) => source.replace(/<\/script/gi, '<\\/script');

const buildHtml = (primary: string, danger: string) => `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<style>${LEAFLET_CSS}</style>
<style>
html,body,#map{margin:0;padding:0;height:100%;width:100%;}
.shell{background:none;border:none;}
.site{width:16px;height:16px;border:3px solid #fff;border-radius:50%;background:${danger};box-shadow:0 1px 5px rgba(11,16,32,.35);}
.worker{display:flex;align-items:center;justify-content:center;width:22px;height:22px;border:2px solid #fff;border-radius:50%;background:${primary};box-shadow:0 1px 5px rgba(11,16,32,.35);}
.worker svg{width:13px;height:13px;fill:#fff;}
</style>
</head><body><div id="map"></div>
<script>${inlineScript(LEAFLET_JS)}</script>
<script>
var map = L.map('map', { zoomControl: false }).setView([20.5937, 78.9629], 5);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
var layer = L.layerGroup().addTo(map);
var siteIcon = L.divIcon({ className: 'shell', iconSize: [22, 22], iconAnchor: [11, 11], html: '<div class="site"></div>' });
var workerIcon = L.divIcon({ className: 'shell', iconSize: [22, 22], iconAnchor: [11, 11],
  html: '<div class="worker"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8z"/></svg></div>' });
var lastCenter = null;
window.render = function (data) {
  layer.clearLayers();
  var circle = L.circle([data.latitude, data.longitude], {
    radius: data.radiusKm * 1000, color: '${primary}', weight: 1, fillOpacity: 0.06
  }).addTo(layer);
  data.workers.forEach(function (w) {
    L.marker([w.latitude, w.longitude], { icon: workerIcon, interactive: false }).addTo(layer);
  });
  L.marker([data.latitude, data.longitude], { icon: siteIcon, interactive: false }).addTo(layer);
  var center = data.latitude + ',' + data.longitude + ',' + data.radiusKm;
  if (center !== lastCenter) {
    map.fitBounds(circle.getBounds(), { padding: [8, 8] });
    lastCenter = center;
  }
};
</script></body></html>`;

/** Work Location, the search radius, and approximate positions of available Workers. */
export const AvailableWorkersMap: FC<AvailableWorkersMapProps> = ({ label, ...data }) => {
  const { colors } = useTheme();
  const webView = useRef<MapWebViewRef>(null);
  const theme = useRef({ primary: colors.primary, danger: colors.danger });
  const html = useMemo(() => buildHtml(theme.current.primary, theme.current.danger), []);
  const payload = JSON.stringify({
    latitude: data.latitude,
    longitude: data.longitude,
    radiusKm: data.radiusKm,
    workers: data.workers,
  });
  const latest = useRef(payload);
  latest.current = payload;

  const render = (json: string) =>
    webView.current?.injectJavaScript(`window.render && window.render(${json}); true;`);

  useEffect(() => {
    render(payload);
  }, [payload]);

  return (
    <View
      accessible
      accessibilityLabel={label}
      accessibilityRole="image"
      style={[styles.map, { borderColor: colors.border }]}
    >
      <MapWebView
        ref={webView}
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://kaaamnow.app' }}
        onLoadEnd={() => render(latest.current)}
        style={styles.webView}
        nestedScrollEnabled
        scrollEnabled={false}
        javaScriptEnabled
        testID="business-live-work-workers-map"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    height: 220,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  /** Android WebView paints blank inside a clipped, rounded parent at opacity 1. */
  webView: { flex: 1, opacity: 0.99 },
});
