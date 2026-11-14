import { useEffect, useState, type RefObject } from 'react';
import { Keyboard, Platform, TextInput, type ScrollView } from 'react-native';

/**
 * Android uses adjustResize to fit the window around the keyboard. This hook tracks
 * keyboard visibility and scrolls the focused field; callers should not apply the
 * returned keyboard height as additional bottom padding.
 */
export const useKeyboardInset = (
  scrollRef?: RefObject<ScrollView | null>,
  scrollOffset = 120,
) => {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const show = Keyboard.addListener('keyboardDidShow', event => {
      setHeight(event.endCoordinates.height);
      const input = TextInput.State.currentlyFocusedInput();
      const scroll = scrollRef?.current;
      if (!input || !scroll) return;
      requestAnimationFrame(() => {
        // Keep focused inputs above pinned actions as well as the keyboard.
        scroll.scrollResponderScrollNativeHandleToKeyboard(
          input,
          scrollOffset,
          true,
        );
      });
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, [scrollRef, scrollOffset]);
  return height;
};
