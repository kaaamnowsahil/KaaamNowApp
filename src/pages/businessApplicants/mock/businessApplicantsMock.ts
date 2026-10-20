export type ApplicantStatus = 'applied' | 'selected' | 'confirmed';

export type BusinessApplicant = {
    id: string;
    name: string;
    experience: string;
    experienceMonths: number;
    category: string;
    rating: number;
    status: ApplicantStatus;
    location: string;
    about: string;
    skills: string[];
    confirmedAt?: string;
    distanceKm?: number;
    arrivalMinutes?: number;
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
        location: 'Koramangala, Bengaluru',
        about: 'Friendly customer service professional with experience supporting busy cafe teams.',
        skills: ['Customer service', 'POS', 'Guest support'],
    },
    {
        id: 'applicant-sana',
        name: 'Sana Khan',
        experience: '2 years',
        experienceMonths: 24,
        category: 'Event service',
        rating: 4.9,
        status: 'applied',
        location: 'Indiranagar, Bengaluru',
        about: 'Experienced event server who enjoys creating a welcoming guest experience.',
        skills: ['Event service', 'Table service', 'Teamwork'],
    },
    {
        id: 'applicant-dev',
        name: 'Dev Patel',
        experience: '8 months',
        experienceMonths: 8,
        category: 'Hospitality',
        rating: 4.7,
        status: 'applied',
        location: 'HSR Layout, Bengaluru',
        about: 'Hospitality team member with a calm approach during busy service periods.',
        skills: ['Hospitality', 'Food safety', 'Communication'],
    },
    {
        id: 'applicant-isha',
        name: 'Isha Nair',
        experience: '1.5 years',
        experienceMonths: 18,
        category: 'Guest service',
        rating: 4.8,
        status: 'applied',
        location: 'Jayanagar, Bengaluru',
        about: 'Guest service professional focused on helpful, attentive customer care.',
        skills: ['Guest service', 'Communication', 'Teamwork'],
    },
    {
        id: 'applicant-kiran',
        name: 'Kiran Das',
        experience: '2 years',
        experienceMonths: 24,
        category: 'Hospitality',
        rating: 4.9,
        status: 'selected',
        location: 'Whitefield, Bengaluru',
        about: 'Hospitality professional experienced in cafe and event service.',
        skills: ['Hospitality', 'Cafe service', 'POS'],
    },
    {
        id: 'applicant-meera',
        name: 'Meera Joseph',
        experience: '1 year',
        experienceMonths: 12,
        category: 'Customer service',
        rating: 4.8,
        status: 'selected',
        location: 'Indiranagar, Bengaluru',
        about: 'Customer service professional with a strong focus on guest satisfaction.',
        skills: ['Customer service', 'Guest support', 'POS'],
    },
    {
        id: 'applicant-aarav-confirmed',
        name: 'Aarav Rao',
        experience: '1 year',
        experienceMonths: 12,
        category: 'Customer service',
        rating: 4.8,
        status: 'confirmed',
        location: 'Koramangala, Bengaluru',
        about: 'Friendly customer service professional with experience supporting busy cafe teams.',
        skills: ['Customer service', 'POS', 'Guest support'],
        confirmedAt: '19 Oct, 12:40',
        distanceKm: 2.4,
        arrivalMinutes: 12,
    },
    {
        id: 'applicant-sana-confirmed',
        name: 'Sana Khan',
        experience: '2 years',
        experienceMonths: 24,
        category: 'Event service',
        rating: 4.9,
        status: 'confirmed',
        location: 'Indiranagar, Bengaluru',
        about: 'Experienced event server who enjoys creating a welcoming guest experience.',
        skills: ['Event service', 'Table service', 'Teamwork'],
        confirmedAt: '19 Oct, 12:12',
        distanceKm: 1.8,
        arrivalMinutes: 9,
    },
    {
        id: 'applicant-dev-confirmed',
        name: 'Dev Patel',
        experience: '8 months',
        experienceMonths: 8,
        category: 'Hospitality',
        rating: 4.7,
        status: 'confirmed',
        location: 'HSR Layout, Bengaluru',
        about: 'Hospitality team member with a calm approach during busy service periods.',
        skills: ['Hospitality', 'Food safety', 'Communication'],
        confirmedAt: '19 Oct, 11:58',
        distanceKm: 3.1,
        arrivalMinutes: 16,
    },
    {
        id: 'applicant-isha-confirmed',
        name: 'Isha Nair',
        experience: '1.5 years',
        experienceMonths: 18,
        category: 'Guest service',
        rating: 4.8,
        status: 'confirmed',
        location: 'Jayanagar, Bengaluru',
        about: 'Guest service professional focused on helpful, attentive customer care.',
        skills: ['Guest service', 'Communication', 'Teamwork'],
        confirmedAt: '19 Oct, 11:30',
        distanceKm: 2.9,
        arrivalMinutes: 14,
    },
];
