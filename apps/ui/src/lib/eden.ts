import type { Server } from '@booga/api/src/server';
import { edenTreaty } from '@elysiajs/eden';
import { getApiBaseUrl } from './apiBaseUrl';

export default edenTreaty<Server>(getApiBaseUrl(), {
  $fetch: {
    credentials: 'include',
  },
});
