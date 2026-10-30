import { useState } from 'react';
import { Text } from 'react-native';
import TestRenderer, { act, type ReactTestRenderer } from 'react-test-renderer';

import { i18n } from '@/services/i18n';
import type {
  CompletionCode,
  PricingMode,
} from '@/services/liveWork/liveWorkTypes';

import { CompletionCodeCard, CompletionCodeField } from '../CompletionCode';
import { PricingModeRadio } from '../PricingModeRadio';

jest.mock('@/components/ui', () => {
  const { Pressable, Text: RNText, TextInput, View } = require('react-native');
  return {
    SecondaryButton: ({
      label,
      onPress,
      disabled,
      testID,
    }: Record<string, any>) => (
      <Pressable disabled={disabled} onPress={onPress} testID={testID}>
        <RNText>{label}</RNText>
      </Pressable>
    ),
    TextField: ({
      label,
      helper,
      error,
      value,
      onChangeText,
      testID,
    }: Record<string, any>) => (
      <View>
        <RNText>{label}</RNText>
        <TextInput value={value} onChangeText={onChangeText} testID={testID} />
        {helper ? <RNText testID={`${testID}-helper`}>{helper}</RNText> : null}
        {error ? <RNText testID={`${testID}-error`}>{error}</RNText> : null}
      </View>
    ),
    RadioCheck: ({ selected }: { selected: boolean }) => (
      <RNText>{selected ? 'selected' : 'unselected'}</RNText>
    ),
  };
});

const open: CompletionCode = {
  code: '482913',
  attempts_left: 5,
  locked: false,
  can_reissue: true,
};

const texts = (tree: ReactTestRenderer) =>
  tree.root
    .findAllByType(Text)
    .map(node => [node.props.children].flat().join(''));

let tree: ReactTestRenderer;
const render = (element: React.ReactElement) =>
  act(() => {
    tree = TestRenderer.create(element);
  });

beforeEach(async () => {
  await act(async () => {
    await i18n.changeLanguage('en');
  });
});
afterEach(() => act(() => tree?.unmount()));

describe('CompletionCodeCard', () => {
  it('shows the Business the code and issues a new one on request', async () => {
    const onReissue = jest.fn();
    await render(
      <CompletionCodeCard completion={open} onReissue={onReissue} />,
    );
    expect(
      tree.root.findByProps({ testID: 'completion-code-card-value' }).props
        .children,
    ).toBe('482913');
    await act(() =>
      tree.root
        .findByProps({ testID: 'completion-code-card-reissue' })
        .props.onPress(),
    );
    expect(onReissue).toHaveBeenCalledTimes(1);
  });

  it('hides a locked code and explains why', async () => {
    await render(
      <CompletionCodeCard
        completion={{ ...open, locked: true }}
        onReissue={jest.fn()}
      />,
    );
    expect(
      tree.root.findAllByProps({ testID: 'completion-code-card-value' }),
    ).toHaveLength(0);
    expect(texts(tree).join(' ')).toContain('Too many wrong tries');
  });

  it('renders nothing without a code (the Worker view)', async () => {
    await render(<CompletionCodeCard completion={{ ...open, code: null }} />);
    expect(tree.toJSON()).toBeNull();
  });
});

describe('CompletionCodeField', () => {
  function Harness({ completion }: { completion: CompletionCode }) {
    const [value, setValue] = useState('');
    return (
      <CompletionCodeField
        value={value}
        onChange={setValue}
        businessName="Chai Point"
        completion={completion}
      />
    );
  }
  const worker = { ...open, code: null };

  it('keeps digits only and names the business to ask', async () => {
    await render(<Harness completion={worker} />);
    const input = tree.root.findByProps({ testID: 'completion-code-input' });
    await act(() => input.props.onChangeText('12a34-56 7'));
    expect(
      tree.root.findByProps({ testID: 'completion-code-input' }).props.value,
    ).toBe('123456');
    const helper = tree.root.findByProps({
      testID: 'completion-code-input-helper',
    });
    expect(helper.props.children).toBe(
      'Ask Chai Point for the code when the work is done.',
    );
  });

  it('shows tries left after a wrong code', async () => {
    await render(<Harness completion={{ ...worker, attempts_left: 1 }} />);
    expect(
      tree.root.findByProps({ testID: 'completion-code-input-helper' }).props
        .children,
    ).toContain('1 try left.');
  });

  it('replaces the input with guidance once locked', async () => {
    await render(<Harness completion={{ ...worker, locked: true }} />);
    expect(
      tree.root.findAllByProps({ testID: 'completion-code-input' }),
    ).toHaveLength(0);
    expect(texts(tree).join(' ')).toContain('Ask Chai Point for a new code');
  });
});

describe('PricingModeRadio', () => {
  function Harness() {
    const [mode, setMode] = useState<PricingMode>('hourly');
    return <PricingModeRadio value={mode} onChange={setMode} />;
  }

  it('switches between hourly and task', async () => {
    await render(<Harness />);
    const selected = (mode: PricingMode) =>
      tree.root.findByProps({ testID: `pricing-mode-${mode}` }).props
        .accessibilityState.selected;
    expect(selected('hourly')).toBe(true);
    await act(() =>
      tree.root.findByProps({ testID: 'pricing-mode-task' }).props.onPress(),
    );
    expect(selected('task')).toBe(true);
    expect(selected('hourly')).toBe(false);
  });
});
