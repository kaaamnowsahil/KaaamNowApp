import type { FC } from 'react';

import BriefcaseIcon from '@/assets/icons/briefcase.svg';
import CalendarIcon from '@/assets/icons/calendar.svg';
import MapPinIcon from '@/assets/figma/map-pin.svg';
import UserIcon from '@/assets/figma/user.svg';
import {
  BodyNote,
  SelectSheetField,
  IconField,
  PrimaryButton,
  ScreenIntro,
} from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import type { AppScreenProps } from '@/types';

import { ADD_ROLE_STRINGS as S } from './constants/addRoleStrings';
import { useAddRole } from './hooks/useAddRole';

/** Signed-in user adds their other role (worker or Business / Work), then switches to it. */
export const AddRolePage: FC<AppScreenProps<typeof ROUTES.addRole>> = ({
  navigation,
  route,
}) => {
  const { role } = route.params;
  const isWorker = role === 'worker';
  const f = useAddRole(role, () =>
    navigation.reset({ index: 0, routes: [{ name: ROUTES.mainTabs }] }),
  );

  return (
    <FormScreen
      busy={f.busy}
      onBack={navigation.goBack}
      testID="add-role-page"
      actions={
        <PrimaryButton
          label={S.submit}
          onPress={f.submit}
          disabled={f.busy || f.optionsLoading || !f.options.length}
          testID="add-role-submit"
        />
      }
    >
      <ScreenIntro
        title={isWorker ? S.workerTitle : S.businessTitle}
        subtitle={isWorker ? S.workerSubtitle : S.businessSubtitle}
      />
      {isWorker ? null : (
        <IconField
          label={S.businessNameLabel}
          icon={BriefcaseIcon}
          placeholder={S.businessNamePlaceholder}
          value={f.form.businessName}
          onChangeText={f.setBusinessName}
          autoCapitalize="words"
          error={f.errors.businessName}
        />
      )}
      <IconField
        label={isWorker ? S.nameLabel : S.contactNameLabel}
        icon={UserIcon}
        placeholder={isWorker ? S.namePlaceholder : S.contactNamePlaceholder}
        value={f.form.name}
        onChangeText={f.setName}
        autoCapitalize="words"
        autoComplete="name"
        error={f.errors.name}
      />
      {isWorker ? (
        <IconField
          label={S.ageLabel}
          icon={CalendarIcon}
          placeholder={S.agePlaceholder}
          value={f.form.age}
          onChangeText={f.setAge}
          keyboardType="number-pad"
          error={f.errors.age}
        />
      ) : null}
      <IconField
        label={S.addressLabel}
        icon={MapPinIcon}
        placeholder={S.addressPlaceholder}
        value={f.form.address}
        onChangeText={f.setAddress}
        autoComplete="street-address"
        action={{
          label: f.isLocating ? S.locating : S.useCurrent,
          onPress: f.isLocating ? undefined : f.locate,
        }}
        error={f.errors.address || f.locateError || undefined}
      />
      <SelectSheetField
        multiple
        label={isWorker ? S.workTypesLabel : S.businessTypesLabel}
        hint={f.optionsError || (f.optionsLoading ? S.loadingOptions : undefined)}
        error={f.errors.types}
        options={f.options}
        selected={f.form.types}
        onToggle={f.toggleType}
      />
      {f.submitError ? <BodyNote>{f.submitError}</BodyNote> : null}
    </FormScreen>
  );
};
