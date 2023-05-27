import { OnCronjobHandler } from '@metamask/snaps-types';

import {
  getAddress,
  getOwnedEnsNames,
  getRelativeDay,
  notify,
} from './ensExpiry';

export const onCronjob: OnCronjobHandler = async ({ request }) => {
  switch (request.method) {
    case 'ensExpiration': {
      console.log('ensExpiration');
      const address = await getAddress();
      console.log(address);
      const ownedEnsNames = await getOwnedEnsNames(address);
      console.log(ownedEnsNames);
      for (const ownedName of ownedEnsNames) {
        const { name, expiration } = ownedName;

        if (!expiration) {
          continue;
        }

        const relativeExpiration = getRelativeDay(expiration);
        let message = `${name} expires in ${relativeExpiration}`;

        if (name.length > 25) {
          message = `You have an ENS name that expires in ${relativeExpiration}`;
        }

        return notify(message);
      }

      return null;
    }

    default:
      throw new Error('Method not found.');
  }
};
