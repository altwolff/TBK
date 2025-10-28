export async function withTimeout(promise, timeoutMs, operationName) {
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`${operationName} timed out`)), timeoutMs)
    );
    return Promise.race([promise, timeout]);
}
