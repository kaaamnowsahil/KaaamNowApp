import { useEffect, useState, type RefObject } from 'react';
import { Keyboard, Platform, TextInput, type ScrollView } from 'react-native';

/**
 * Android draws edge to edge, so the window does not shrink when the keyboard opens.
 * iOS already lifts the screen through KeyboardAvoidingView.
 * `scrollRef` moves the focused field above the keyboard.
 */
export const useKeyboardInset = (scrollRef?: RefObject<ScrollView | null>) => {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const show = Keyboard.addListener('keyboardDidShow', event => {
      setHeight(event.endCoordinates.height);
      const input = TextInput.State.currentlyFocusedInput();
      const scroll = scrollRef?.current;
      if (!input || !scroll) return;
      requestAnimationFrame(() => {
        scroll.scrollResponderScrollNativeHandleToKeyboard(input, 120, true);
      });
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, [scrollRef]);
  return height;
};
