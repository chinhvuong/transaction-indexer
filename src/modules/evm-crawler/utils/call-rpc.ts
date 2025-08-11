import { ethers } from 'ethers';

function isRateLimitError(err: unknown): boolean {
  return err instanceof Error && err.message.includes('429');
}

function isPrunedError(err: unknown): boolean {
  return err instanceof Error && err.message.includes('has been pruned');
}

function isDisconnectError(err: unknown): boolean {
  return err instanceof Error && err.message.includes('disconnect');
}

function isDetectNetworkError(err: unknown): boolean {
  return (
    err instanceof Error && err.message.includes('failed to detect network')
  );
}

function isJsonRpcProviderError(err: unknown): boolean {
  return (
    err instanceof Error && err.message?.toLowerCase()?.includes('internal')
  );
}

const providers = new Map<string, ethers.JsonRpcProvider>();

function getProvider(rpcUrl: string): ethers.JsonRpcProvider {
  let provider = providers.get(rpcUrl);
  if (!provider) {
    provider = new ethers.JsonRpcProvider(rpcUrl);
    providers.set(rpcUrl, provider);
  }
  return provider;
}

export async function callRpc<T>(
  f: (provider: ethers.JsonRpcProvider) => Promise<T>,
  rpcUrls: string[],
): Promise<T> {
  let lastError: unknown;

  for (const rpcUrl of rpcUrls) {
    try {
      const provider = getProvider(rpcUrl);
      return await f(provider);
    } catch (err: unknown) {
      if (
        isRateLimitError(err) ||
        isPrunedError(err) ||
        isDisconnectError(err) ||
        isDetectNetworkError(err) ||
        isJsonRpcProviderError(err)
      ) {
        lastError = err;
        continue;
      } else {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        console.log('RPC Call Error:', errorMessage, rpcUrl);
        throw err;
      }
    }
  }
  if (lastError instanceof Error) {
    throw lastError;
  }
  throw new Error('All RPC calls failed');
}
