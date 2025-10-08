const trimTrailingSlash = url => (url.endsWith('/') ? url.slice(0, -1) : url);

const getDefaultApiBaseUrl = () => {
	if (typeof window === 'undefined') {
		return 'http://localhost:8080';
	}

	const { protocol, hostname } = window.location;
	const port = process.env.REACT_APP_API_PORT || '8080';
	const sanitizedPort = port ? `:${port.replace(/^:/, '')}` : '';
	return `${protocol}//${hostname}${sanitizedPort}`;
};

const getWebSocketUrl = (apiBaseUrl) => {
	// If WS_URL is explicitly set, use it
	if (process.env.REACT_APP_WS_URL?.trim()) {
		return trimTrailingSlash(process.env.REACT_APP_WS_URL.trim());
	}
	
	// Auto-convert HTTP/HTTPS to WS/WSS
	const wsUrl = apiBaseUrl
		.replace('https://', 'wss://')
		.replace('http://', 'ws://');
	
	return `${wsUrl}/ws`;
};

const resolvedApiBase = trimTrailingSlash(
	process.env.REACT_APP_API_BASE_URL?.trim() || getDefaultApiBaseUrl()
);

export const BASE_API_URL = resolvedApiBase;
export const WS_ENDPOINT = getWebSocketUrl(resolvedApiBase);
export const TOKEN = 'token';
