import { repostForm, validateLiveWorkForm } from '../liveWorkFormat';
import type { LiveWorkDetails } from '../liveWorkTypes';

const work: LiveWorkDetails = {
  category_slug: 'kitchen-help',
  category_name: 'Kitchen help',
  job_title: 'Kitchen helper',
  description: 'Wash dishes',
  address_text: 'MG Road, Pune',
  latitude: 18.5,
  longitude: 73.8,
  arrival_instructions: 'Back door',
  site_contact_name: 'Asha',
  business_name: 'Cafe',
  reserved_minutes: 150,
  hourly_rate_minor: 45050,
  pricing_mode: 'hourly',
  task_price_minor: null,
};

describe('repostForm', () => {
  it('fills every field from the past booking', () => {
    const form = repostForm({ work, workers: 3 });
    expect(form).toEqual({
      categorySlug: 'kitchen-help',
      jobTitle: 'Kitchen helper',
      description: 'Wash dishes',
      address: 'MG Road, Pune',
      latitude: 18.5,
      longitude: 73.8,
      instructions: 'Back door',
      siteContact: 'Asha',
      pricingMode: 'hourly',
      durationMinutes: 150,
      rate: '450.5',
      taskPrice: '',
      workers: 3,
    });
    expect(validateLiveWorkForm(form)).toEqual({});
  });

  it('keeps a valid duration for a task booking', () => {
    const form = repostForm({
      work: {
        ...work,
        pricing_mode: 'task',
        reserved_minutes: 0,
        task_price_minor: 80000,
      },
      workers: 1,
    });
    expect(form.taskPrice).toBe('800');
    expect(form.durationMinutes).toBe(120);
  });
});
