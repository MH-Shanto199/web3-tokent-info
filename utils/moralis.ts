import { settings } from './../settings';
import { ApiUtilsConfig } from '@moralisweb3/api-utils';
import Moralis from 'moralis';

const apiKey = Moralis.Core.config.get(ApiUtilsConfig.apiKey)
if (! apiKey) {
  Moralis.start({
    apiKey: settings.moralisApi,
  })
}

export const SoftAxisMoralis = Moralis
