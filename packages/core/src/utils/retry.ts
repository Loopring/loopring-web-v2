export const withRetry = <T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  maxRetries: number,
  delayMs?: number
): ((...args: Args) => Promise<T>) => {
  const retryFn = async (
    args: Args,
    retriesLeft: number,
    lastError?: Error | unknown
  ): Promise<T> => {
    if (retriesLeft < 0 && lastError) {
      throw lastError;
    }

    try {
      return await fn(...args);
    } catch (err) {
      if (retriesLeft > 0) {
        if (delayMs) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
        
        return retryFn(args, retriesLeft - 1, err);
      }
      
      throw err;
    }
  };

  return async (...args: Args): Promise<T> => {
    return retryFn(args, maxRetries);
  };
};
