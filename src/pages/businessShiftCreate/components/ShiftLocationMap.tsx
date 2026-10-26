import { useEffect, useMemo, useRef, type FC } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { LEAFLET_CSS, LEAFLET_JS } from '@/assets/leaflet/leafletSource';
import { useTheme } from '@/theme/ThemeProvider';

/** The package's default generic (`undefined`) collapses every prop to `never`. */
const MapWebView = WebView<object>;
type MapWebViewRef = WebView<object>;

type Pin = { latitude: number; longitude: number };

type ShiftLocationMapProps = {
  pin: Pin | null;
  disabled?: boolean;
  onPick: (pin: Pin) => void;
};

/** Same OpenStreetMap + Leaflet map as web: tap to place the pin or drag it. */
const inlineScript = (source: string) => source.replace(/<\/script/gi, '<\\/script');

const buildHtml = (start: Pin | null, pinColor: string) => `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<style>${LEAFLET_CSS}</style>
<style>html,body,#map{margin:0;padding:0;height:100%;width:100%;}.pin{background:none;border:none;}</style>
</head><body><div id="map"></div>
<script>${inlineScript(LEAFLET_JS)}</script>
<script>
var start = ${JSON.stringify(start)};
var pinIcon = L.divIcon({
  className: 'pin',
  iconSize: [30, 40],
  iconAnchor: [15, 40],
  html: '<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M15 0C6.7 0 0 6.7 0 15c0 11.2 15 25 15 25s15-13.8 15-25C30 6.7 23.3 0 15 0z" fill="${pinColor}"/>' +
    '<circle cx="15" cy="15" r="6" fill="#fff"/></svg>'
});
var disabled = false;
var map = L.map('map').setView(
  start ? [start.latitude, start.longitude] : [20.5937, 78.9629],
  start ? 15 : 5
);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
var marker = null;
function send(ll) {
  window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: ll.lat, longitude: ll.lng }));
}
function place(lat, lng, recenter) {
  if (!marker) {
    marker = L.marker([lat, lng], { draggable: true, icon: pinIcon }).addTo(map);
    marker.on('dragend', function () { if (!disabled) send(marker.getLatLng()); });
  } else {
    marker.setLatLng([lat, lng]);
  }
  if (recenter) map.setView([lat, lng], Math.max(map.getZoom(), 15));
}
if (start) place(start.latitude, start.longitude, false);
map.on('click', function (e) {
  if (disabled) return;
  place(e.latlng.lat, e.latlng.lng, false);
  send(e.latlng);
});
window.setPin = function (lat, lng) { place(lat, lng, true); };
window.setDisabled = function (value) { disabled = value; };
</script></body></html>`;

export const ShiftLocationMap: FC<ShiftLocationMapProps> = ({
  pin,
  disabled = false,
  onPick,
}) => {
  const { colors } = useTheme();
  const webView = useRef<MapWebViewRef>(null);
  const initialPin = useRef(pin);
  const lastSent = useRef<Pin | null>(null);
  const pinColor = useRef(colors.primary);
  const html = useMemo(() => buildHtml(initialPin.current, pinColor.current), []);

  useEffect(() => {
    if (!pin) return;
    const sent = lastSent.current;
    if (sent && sent.latitude === pin.latitude && sent.longitude === pin.longitude) {
      return;
    }
    webView.current?.injectJavaScript(
      `window.setPin && window.setPin(${pin.latitude}, ${pin.longitude}); true;`,
    );
  }, [pin]);

  useEffect(() => {
    webView.current?.injectJavaScript(
      `window.setDisabled && window.setDisabled(${disabled}); true;`,
    );
  }, [disabled]);

  const onMessage = (event: WebViewMessageEvent) => {
    try {
      const next = JSON.parse(event.nativeEvent.data) as Pin;
      if (Number.isFinite(next.latitude) && Number.isFinite(next.longitude)) {
        lastSent.current = next;
        onPick(next);
      }
    } catch {
      // Ignore messages that are not pin updates.
    }
  };

  return (
    <View style={[styles.map, { borderColor: colors.border }]}>
      <MapWebView
        ref={webView}
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://kaaamnow.app' }}
        onMessage={onMessage}
        style={styles.webView}
        nestedScrollEnabled
        scrollEnabled={false}
        javaScriptEnabled
        testID="business-shift-location-map"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    height: 240,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  /** Android WebView paints blank inside a clipped, rounded parent at opacity 1. */
  webView: { flex: 1, opacity: 0.99 },
});
