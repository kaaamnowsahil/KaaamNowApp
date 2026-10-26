import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { BottomSheet, ChipGroup, PrimaryButton } from '@/components/ui';
import type { Option } from '@/types';

import type { ApplicantShiftFilter, ApplicantSort } from '../hooks';

const SORT_IDS: ApplicantSort[] = ['time', 'nearest', 'pay', 'recent', 'rating', 'experience'];

export const ApplicantsSortSheet: FC<{
    sort: ApplicantSort;
    shiftId: ApplicantShiftFilter;
    shifts: Option[];
    onSort: (sort: ApplicantSort) => void;
    onShift: (shiftId: ApplicantShiftFilter) => void;
    onClose: () => void;
}> = ({ sort, shiftId, shifts, onSort, onShift, onClose }) => {
    const { t } = useTranslation();
    const sortOptions: Option[] = SORT_IDS.map(id => ({
        id,
        label: t(`businessApplicants.sort${id[0].toUpperCase()}${id.slice(1)}`),
    }));
    const shiftOptions: Option[] = [
        { id: 'all', label: t('businessApplicants.allShifts') },
        ...shifts,
    ];

    return (
        <BottomSheet
            title={t('businessApplicants.filterTitle')}
            onClose={onClose}
            closeLabel={t('businessApplicants.close')}
        >
            <ChipGroup
                label={t('businessApplicants.sortBy')}
                options={sortOptions}
                selected={[sort]}
                onToggle={id => onSort(id as ApplicantSort)}
            />
            <ChipGroup
                label={t('businessApplicants.shiftFilter')}
                options={shiftOptions}
                selected={[shiftId]}
                onToggle={onShift}
            />
            <PrimaryButton label={t('businessApplicants.close')} onPress={onClose} />
        </BottomSheet>
    );
};
