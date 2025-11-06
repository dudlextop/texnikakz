import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';
import { OPENSEARCH_CLIENT } from './constants';

export const openSearchClientProvider: Provider<Client> = {
  provide: OPENSEARCH_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const node = configService.get<string>('OPENSEARCH_NODE', 'http://localhost:9200');
    const username = configService.get<string>('OPENSEARCH_USERNAME');
    const password = configService.get<string>('OPENSEARCH_PASSWORD');
    const rejectUnauthorized = configService.get<string>('OPENSEARCH_TLS_REJECT_UNAUTHORIZED', 'false') === 'true';

    return new Client({
      node,
      ...(username && password
        ? {
            auth: {
              username,
              password
            }
          }
        : {}),
      ssl: {
        rejectUnauthorized
      }
    });
  }
};
