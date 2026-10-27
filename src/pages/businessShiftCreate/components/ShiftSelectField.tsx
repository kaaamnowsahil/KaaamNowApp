import type { FC } from 'react';

import { SelectSheetField } from '@/components/ui/SelectSheetField';

type ShiftSelectFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  options: { id: string; label: string }[];
  onChange: (value: string) => void;
  searchPlaceholder?: string;
  disabled?: boolean;
  error?: string;
  testID?: string;
};

/** Single-choice dropdown styled like the shift form fields; options open in a searchable sheet. */
export const ShiftSelectField: FC<ShiftSelectFieldProps> = ({
  value,
  onChange,
  ...props
}) => (
  <SelectSheetField
    {...props}
    variant="compact"
    selected={value ? [value] : []}
    onToggle={onChange}
  />
);
