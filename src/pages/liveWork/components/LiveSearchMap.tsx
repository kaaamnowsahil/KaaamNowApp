import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { LEAFLET_CSS, LEAFLET_JS } from '@/assets/leaflet/leafletSource';
import { FONTS } from '@/constants/fonts';
import { liveWorkApi } from '@/services/liveWork/liveWorkApi';
import type { LiveWorkerDot } from '@/services/liveWork/liveWorkTypes';
import { useTheme } from '@/theme/ThemeProvider';

/** The package's default generic (`undefined`) collapses every prop to `never`. */
const MapWebView = WebView<object>;
type MapWebViewRef = WebView<object>;

const WORKERS_REFRESH_MS = 15_000;

const inlineScript = (source: string) => source.replace(/<\/script/gi, '<\\/script');

const buildHtml = (primary: string) => `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<style>${LEAFLET_CSS}</style>
<style>
html,body,#map{margin:0;padding:0;height:100%;width:100%;}
.shell{background:none;border:none;}
.worker{display:flex;align-items:center;justify-content:center;width:22px;height:22px;border:2px solid #fff;border-radius:50%;background:${primary};box-shadow:0 1px 5px rgba(11,16,32,.35);}
.worker svg{width:13px;height:13px;fill:#fff;}
.radar{position:absolute;inset:0;z-index:500;display:grid;place-items:center;pointer-events:none;}
.radar span{grid-area:1/1;border-radius:50%;}
.sweep{width:200px;height:200px;background:conic-gradient(from 0deg,transparent 0deg,transparent 270deg,${primary}66 360deg);animation:spin 2.4s linear infinite;}
.ring{width:200px;height:200px;border:2px solid ${primary};opacity:0;animation:pulse 2.4s ease-out infinite;}
.ring.late{animation-delay:1.2s;}
.pin{width:18px;height:18px;border:3px solid #fff;background:${primary};box-shadow:0 1px 6px rgba(11,16,32,.35);}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes pulse{from{opacity:.7;transform:scale(.1);}to{opacity:0;transform:scale(1);}}
</style>
</head><body><div id="map"></div>
<div class="radar"><span class="sweep"></span><span class="ring"></span><span class="ring late"></span><span class="pin"></span></div>
<script>${inlineScript(LEAFLET_JS)}</script>
<script>
var map = L.map('map', {
  zoomControl: false, dragging: false, touchZoom: false, doubleClickZoom: false,
  scrollWheelZoom: false, boxZoom: false, keyboard: false
}).setView([20.5937, 78.9629], 5);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
var layer = L.layerGroup().addTo(map);
var workerIcon = L.divIcon({ className: 'shell', iconSize: [22, 22], iconAnchor: [11, 11],
  html: '<div class="worker"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8z"/></svg></div>' });
window.render = function (data) {
  map.setView([data.latitude, data.longitude], 14);
  layer.clearLayers();
  data.workers.forEach(function (w) {
    L.marker([w.latitude, w.longitude], { icon: workerIcon, interactive: false }).addTo(layer);
  });
};
</script></body></html>`;

type LiveSearchMapProps = {
  latitude: number;
  longitude: number;
  category?: string | null;
  /** Shown on the map, e.g. "Search time left: 29:56". */
  timerLabel: string;
  label: string;
};

/**
 * Ride-app style "finding a worker" map: a radar sweeping the Work Location, nearby Workers and
 * the search countdown. The map is fixed on the Work Location so the radar stays centred.
 */
export const LiveSearchMap: FC<LiveSearchMapProps> = ({
  latitude,
  longitude,
  category,
  timerLabel,
  label,
}) => {
  const { colors } = useTheme();
  const webView = useRef<MapWebViewRef>(null);
  const primary = useRef(colors.primary);
  const html = useMemo(() => buildHtml(primary.current), []);
  const [workers, setWorkers] = useState<LiveWorkerDot[]>([]);

  useEffect(() => {
    let cancelled = false;
    const refresh = () =>
      liveWorkApi
        .availableWorkers({
          lat: latitude,
          lng: longitude,
          category: category || undefined,
        })
        .then(next => !cancelled && setWorkers(next.workers))
        .catch(() => undefined);
    refresh();
    const poll = setInterval(refresh, WORKERS_REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(poll);
    };
  }, [category, latitude, longitude]);

  const payload = JSON.stringify({ latitude, longitude, workers });
  const latest = useRef(payload);
  latest.current = payload;

  const render = (json: string) =>
    webView.current?.injectJavaScript(
      `window.render && window.render(${json}); true;`,
    );

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
        scrollEnabled={false}
        javaScriptEnabled
        testID="business-live-work-search-map"
      />
      <View
        pointerEvents="none"
        style={[styles.timer, { backgroundColor: colors.surface }]}
      >
        <Text style={[styles.timerText, { color: colors.text }]}>
          {timerLabel}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    height: 240,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  /** Android WebView paints blank inside a clipped, rounded parent at opacity 1. */
  webView: { flex: 1, opacity: 0.99 },
  timer: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: '#0b1020',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  timerText: { fontFamily: FONTS.semiBold, fontSize: 13, lineHeight: 18 },
});
