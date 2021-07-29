export function getCachedSession(): any {
    const local = localStorage ? localStorage.getItem("walletconnect") : null;

    let session = null;
    if (local) {
        try {
            session = JSON.parse(local);
        } catch (error) {
            throw error;
        }
    }
    return session;
}