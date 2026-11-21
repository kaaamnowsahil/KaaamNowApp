import { useEffect, useRef, useState, type RefObject } from 'react';
import {
  Keyboard,
  Platform,
  TextInput,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollView,
  type View,
} from 'react-native';

let nudgeFocused: (() => void) | null = null;

/** Ask the open form to move the focused field above the pinned button. */
export const nudgeFocusedField = () => {
  nudgeFocused?.();
};

const KEYBOARD_GAP = 8;

/**
 * Pads only the part of the frame that the keyboard actually covers.
 * A full keyboard height would leave an empty band above the keys.
 */
export const useKeyboardInset = (
  scrollRef?: RefObject<ScrollView | null>,
  _scrollOffset = 8,
  frameRef?: RefObject<View | null>,
) => {
  const [height, setHeight] = useState(0);
  const scrollY = useRef(0);

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;
    let cancelLater = () => {};
    const show = Keyboard.addListener('keyboardDidShow', event => {
      const keyboardTop = event.endCoordinates.screenY;
      const apply = () => {
        const frame = frameRef?.current;
        if (!frame) {
          setHeight(0);
          return;
        }
        frame.measureInWindow((_x, y, _w, h) => {
          const covered = Math.round(y + h - keyboardTop);
          setHeight(covered > KEYBOARD_GAP ? covered - KEYBOARD_GAP : 0);
        });
      };
      apply();
      const later = setTimeout(apply, 160);
      cancelLater = () => clearTimeout(later);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      scrollY.current = 0;
      setHeight(0);
    });
    return () => {
      cancelLater();
      show.remove();
      hide.remove();
    };
  }, [frameRef]);

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;
    const nudge = () => {
      const input = TextInput.State.currentlyFocusedInput();
      const scroll = scrollRef?.current;
      if (!input || !scroll) return;
      input.measureInWindow((_x, inputY, _w, inputH) => {
        scroll.measureInWindow((_sx, scrollTop, _sw, scrollH) => {
          const covered = inputY + inputH + 12 - (scrollTop + scrollH);
          if (covered <= 0) return;
          scroll.scrollTo({
            y: Math.max(0, scrollY.current + covered),
            animated: true,
          });
        });
      });
    };
    nudgeFocused = nudge;
    const timer = setTimeout(nudge, 80);
    return () => {
      clearTimeout(timer);
      if (nudgeFocused === nudge) nudgeFocused = null;
    };
  }, [height, scrollRef]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.current = event.nativeEvent.contentOffset.y;
  };

  return { height, onScroll };
};
