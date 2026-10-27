import TestRenderer, { act, type ReactTestRenderer } from 'react-test-renderer';

import '@/services/i18n';

import { CouponRow } from '../CouponRow';

let tree: ReactTestRenderer;
const byId = (id: string) => tree.root.findByProps({ testID: id });
const text = () => JSON.stringify(tree.toJSON());

function renderRow(props: Partial<Parameters<typeof CouponRow>[0]> = {}) {
  const handlers = { onOpen: jest.fn(), onRemove: jest.fn() };
  act(() => {
    tree = TestRenderer.create(
      <CouponRow
        appliedCode={null}
        savedMinor={0}
        disabled={false}
        {...handlers}
        {...props}
      />,
    );
  });
  return handlers;
}

describe('CouponRow', () => {
  it('opens Apply Coupon', () => {
    const { onOpen } = renderRow();
    expect(text()).toContain('Apply coupon');
    byId('coupon-row-open').props.onPress();
    expect(onOpen).toHaveBeenCalled();
  });

  it('shows the applied code and what it saves', () => {
    const { onOpen, onRemove } = renderRow({
      appliedCode: 'save10',
      savedMinor: 15050,
    });
    expect(text()).toContain('SAVE10 applied');
    expect(text()).toContain('You save ₹150.5');
    byId('coupon-row-change').props.onPress();
    byId('coupon-row-remove').props.onPress();
    expect(onOpen).toHaveBeenCalled();
    expect(onRemove).toHaveBeenCalled();
  });

  it('hides the saving when nothing is saved and ignores remove while busy', () => {
    const { onRemove } = renderRow({
      appliedCode: 'X1',
      savedMinor: 0,
      disabled: true,
    });
    expect(text()).not.toContain('You save');
    byId('coupon-row-remove').props.onPress();
    expect(onRemove).not.toHaveBeenCalled();
  });
});
