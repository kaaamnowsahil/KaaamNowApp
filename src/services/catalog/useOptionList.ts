import { useQuery } from '@tanstack/react-query';

import type { Option } from '@/constants/options';
import { http } from '@/services/api/httpClient';

type ApiItem = {
  id: string | number;
  slug?: string;
  name?: string;
  label?: string;
};
type ApiList = ApiItem[] | { results: ApiItem[] };

const toOptions = (data: ApiList): Option[] =>
  (Array.isArray(data) ? data : data.results)
    .map(item => ({
      id: String(item.slug ?? item.id),
      label: item.name ?? item.label ?? '',
    }))
    .filter(option => option.label);

/** Backend option list with a local fallback, so the form always has choices. */
export const useOptionList = (endpoint: string, fallback: Option[]) => {
  const query = useQuery({
    queryKey: ['options', endpoint],
    queryFn: async () => toOptions(await http<ApiList>(endpoint)),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
  const options = query.data?.length ? query.data : fallback;
  return { options, isLoading: query.isLoading };
};
