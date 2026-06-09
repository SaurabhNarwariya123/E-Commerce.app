const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const MAX_CACHE_SIZE = 200;

const getCacheKey = (systemPrompt, userPrompt) => {
    // Key = first 80 chars of systemPrompt + full userPrompt (lowercased)
    return `${systemPrompt.slice(0, 80)}|${userPrompt.toLowerCase().trim()}`;
};

const get = (systemPrompt, userPrompt) => {
    const key = getCacheKey(systemPrompt, userPrompt);
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > CACHE_TTL) {
        cache.delete(key);
        return null;
    }
    return entry.data;
};

const set = (systemPrompt, userPrompt, data) => {
    if (cache.size >= MAX_CACHE_SIZE) {
        // evict oldest entry
        cache.delete(cache.keys().next().value);
    }
    const key = getCacheKey(systemPrompt, userPrompt);
    cache.set(key, { data, ts: Date.now() });
};

const stats = () => ({ size: cache.size, maxSize: MAX_CACHE_SIZE });

export default { get, set, stats };
