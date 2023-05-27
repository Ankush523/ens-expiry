import { OnCronjobHandler } from '@metamask/snaps-types';

import {
  getAddress,
  getRelativeDay,
  notify,
  getOwnedEnsNames,
} from './ensExpiry';

export const onCronjob: OnCronjobHandler = async ({ request }) => {
  switch (request.method) {
    case 'ensExpiration': {
      let userAddress: any = await getAddress();
      userAddress = userAddress.toLowerCase();
      console.log(userAddress);
      const ownedEnsNames = await getOwnedEnsNames();
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
