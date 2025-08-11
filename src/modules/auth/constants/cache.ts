export function accessTokenPayloadExpiredKey(id: string) {
  // set true when role, permissions has been changed or user has been deleted, expire time equals to access token expiration time (5min)
  return `access-token-payload-expired:${id}`;
}

export function nonceKey(walletAddress: string, chainType: string) {
  return `nonce:${walletAddress}:${chainType}`;
}
