import {useCallback, useState} from "react";

interface UseHttpReturn<T> {
    http: (url: RequestInfo | URL, init ?: RequestInit) => Promise<Response>;
    isLoading: boolean;
    error: string | null;
    clearError: () => void;
    data: T | null;
    clearData: () => void;
}

interface HttpOptions {
    isParseJson?: boolean;
}

export const useHttp = <T = any>(options ?: HttpOptions): UseHttpReturn<T> => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<T | null>(null);

    const http = useCallback(
        async (url: RequestInfo | URL, init ?: RequestInit): Promise<Response> => {
            try {
                setIsLoading(true);
                setError(null);
                setData(null);
                const response = await fetch(url, init);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const contentType = response.headers.get('content-type');
                if (options?.isParseJson && contentType?.includes('application/json')) {
                    const jsonData: T = await response.json();
                    setData(jsonData);
                }

                return response;
            } catch (e) {
                const errorMessage = e instanceof Error ? e.message : 'Unknown error.';
                setError(errorMessage);
                throw e;
            } finally {
                setIsLoading(false);
            }
        },
        [options?.isParseJson]
    );

    const clearError = useCallback(() => setError(null), []);
    const clearData = useCallback(() => setData(null), []);

    return {http, isLoading, error, clearError, data, clearData};
}

