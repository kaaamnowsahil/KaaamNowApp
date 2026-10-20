export type ApplicantStatus = 'applied' | 'selected' | 'confirmed';

export type BusinessApplicant = {
    id: string;
    name: string;
    experience: string;
    experienceMonths: number;
    category: string;
    rating: number;
    status: ApplicantStatus;
};

export const BUSINESS_APPLICANTS: BusinessApplicant[] = [
    {
        id: 'applicant-aarav',
        name: 'Aarav Rao',
        experience: '1 year',
        experienceMonths: 12,
        category: 'Customer service',
        rating: 4.8,
        status: 'applied',
    },
    {
        id: 'applicant-sana',
        name: 'Sana Khan',
        experience: '2 years',
        experienceMonths: 24,
        category: 'Event service',
        rating: 4.9,
        status: 'applied',
    },
    {
        id: 'applicant-dev',
        name: 'Dev Patel',
        experience: '8 months',
        experienceMonths: 8,
        category: 'Hospitality',
        rating: 4.7,
        status: 'applied',
    },
    {
        id: 'applicant-isha',
        name: 'Isha Nair',
        experience: '1.5 years',
        experienceMonths: 18,
        category: 'Guest service',
        rating: 4.8,
        status: 'applied',
    },
];