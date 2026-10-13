"use strict";

(function () {
    const DB_NAME = "GymTrackerDB";
    const DB_VERSION = 1;

    const STORES = {
        workouts: "workouts",
        exercises: "exercises",
        sessions: "sessions",
        exerciseSets: "exerciseSets",
        measurements: "measurements",
        scheduledWorkouts: "scheduledWorkouts",
        weeklyRoutines: "weeklyRoutines",
        preferences: "preferences"
    };

    let dbPromise = null;

    function openDB() {
        if (dbPromise) return dbPromise;

        dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = () => {
                const db = request.result;
                Object.values(STORES).forEach((storeName) => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        db.createObjectStore(storeName, { keyPath: "id" });
                    }
                });
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        return dbPromise;
    }

    async function store(storeName, mode = "readonly") {
        const db = await openDB();
        return db.transaction(storeName, mode).objectStore(storeName);
    }

    function requestPromise(request) {
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async function all(storeName) {
        const objectStore = await store(storeName);
        return requestPromise(objectStore.getAll());
    }

    async function get(storeName, id) {
        const objectStore = await store(storeName);
        return requestPromise(objectStore.get(id));
    }

    async function put(storeName, value) {
        const objectStore = await store(storeName, "readwrite");
        await requestPromise(objectStore.put(value));
        return value;
    }

    async function remove(storeName, id) {
        const objectStore = await store(storeName, "readwrite");
        return requestPromise(objectStore.delete(id));
    }

    async function clear(storeName) {
        const objectStore = await store(storeName, "readwrite");
        return requestPromise(objectStore.clear());
    }

    async function exportAll() {
        const result = { version: 1, createdAt: new Date().toISOString() };
        for (const [key, storeName] of Object.entries(STORES)) {
            result[key] = await all(storeName);
        }
        return result;
    }

    async function importAll(data) {
        const keys = Object.keys(STORES);
        for (const key of keys) {
            const storeName = STORES[key];
            await clear(storeName);
            const values = Array.isArray(data[key]) ? data[key] : [];
            for (const value of values) {
                await put(storeName, value);
            }
        }
    }

    function id() {
        if (window.crypto && typeof window.crypto.randomUUID === "function") {
            return window.crypto.randomUUID();
        }
        return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }

    window.GymDB = {
        STORES,
        openDB,
        all,
        get,
        put,
        remove,
        clear,
        exportAll,
        importAll,
        id
    };
})();
