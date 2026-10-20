import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { BottomSheet, ChipGroup, PrimaryButton } from '@/components/ui';
import type { Option } from '@/types';

import type { ApplicantSort } from '../hooks';

const SORT_IDS: ApplicantSort[] = ['recent', 'rating', 'experience'];

export const ApplicantsSortSheet: FC<{
    sort: ApplicantSort;
    onSort: (sort: ApplicantSort) => void;
    onClose: () => void;
}> = ({ sort, onSort, onClose }) => {
    const { t } = useTranslation();
    const options: Option[] = SORT_IDS.map(id => ({
        id,
        label: t(`businessApplicants.sort${id[0].toUpperCase()}${id.slice(1)}`),
    }));

    return (
        <BottomSheet
            title={t('businessApplicants.filterTitle')}
            onClose={onClose}
            closeLabel={t('businessApplicants.close')}
        >
            <ChipGroup
                label={t('businessApplicants.filterTitle')}
                options={options}
                selected={[sort]}
                onToggle={id => onSort(id as ApplicantSort)}
            />
            <PrimaryButton label={t('businessApplicants.close')} onPress={onClose} />
        </BottomSheet>
    );
};