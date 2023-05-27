import { computeAddress } from '@ethersproject/transactions';
import { SubgraphResponse } from './schema';

/**
 * Trigger both types of notifications.
 *
 * @param message - The message to display in the notification.
 */
export function notify(message: string) {
  snap.request({
    method: 'snap_notify',
    params: {
      type: 'inApp',
      message,
    },
  });

  snap.request({
    method: 'snap_notify',
    params: {
      type: 'native',
      message,
    },
  });
}

/**
 * Convert an ENS name expiration date to a relative day count.
 *
 * @param expiration - The timestamp of an ENS name's expiration.
 * @returns The relative day count.
 */
export function getRelativeDay(expiration: number) {
  const now = new Date();
  const expirationDate = new Date(expiration);
  const timeDiff = expirationDate.getTime() - now.getTime();
  const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return `${dayDiff} days`;
}

// eslint-disable-next-line jsdoc/require-description
/**
 *
 */
export async function getOwnedEnsNames() {
  const expiryTime = Math.floor(Date.now() / 1000) + 1000 * 24 * 60 * 60;

  // mainnet subgraph is https://api.thegraph.com/subgraphs/name/ensdomains/ens
  const response = await fetch(
    'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `{domains(where:{owner:"${'0xCF1E6Ab1949D0573362f5278FAbCa4Ec74BE913C'.toLowerCase()}"registration_:{expiryDate_lte: ${expiryTime}}}){name registration {expiryDate}}}`,
      }),
    },
  );
  // const json: any = await response.json();
  // console.log(json.data.domains.map((domain: any) => domain.name));

  const json = (await response.json()) as SubgraphResponse;
  return json.data.domains.map((domain: any) => {
    const timestampStr = domain.registration.expiryDate;
    console.log(timestampStr);

    return {
      name: domain.name,
      expiration: timestampStr ? parseFloat(timestampStr) * 1000 : null,
    };
  });
}

/**
 * Get the public address of the first MetaMask account.
 */
export async function getAddress() {
  const publicKey = await snap.request({
    method: 'snap_getBip32PublicKey',
    params: {
      path: ['m', "44'", "60'", "0'", '0', '0'],
      curve: 'secp256k1',
      compressed: true,
    },
  });

  return computeAddress(publicKey);
}
