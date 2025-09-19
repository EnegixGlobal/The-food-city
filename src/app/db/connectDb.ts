import mongoose from "mongoose";

// Use a global cached connection in development to prevent creating
// multiple connections & adding many event listeners (causing
// MaxListenersExceededWarning) when Next.js hot-reloads route handlers.

interface MongooseGlobal {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    // Using var to augment global in Node.js runtime
    var _mongooseGlobal: MongooseGlobal | undefined;
}

const globalCache: MongooseGlobal = global._mongooseGlobal || {
    conn: null,
    promise: null,
};

if (!global._mongooseGlobal) {
    global._mongooseGlobal = globalCache;
}

const connectDb = async () => {
    if (globalCache.conn) return globalCache.conn;

    if (!globalCache.promise) {
        const uri = process.env.MONGODB_URI || "";
        if (!uri) throw new Error("MONGODB_URI is not defined in environment variables");

        globalCache.promise = mongoose.connect(uri, {
            // Add any needed mongoose options here
            autoIndex: true, // ensure indexes are created once
        });
    }

    try {
        globalCache.conn = await globalCache.promise;

        // Attach listeners only once
        const connection = mongoose.connection;
        if (connection.listeners("connected").length === 0) {
            connection.on("connected", () => {
                console.log("MongoDB connected successfully");
            });
        }
        if (connection.listeners("error").length === 0) {
            connection.on("error", (err) => {
                console.error("MongoDB connection error:", err);
            });
        }

            // One-time legacy index fix: ensure phone index is sparse+unique.
            // We attempt this only once per runtime to avoid overhead.
                const g = global as unknown as { _phoneIndexChecked?: boolean };
                if (!g._phoneIndexChecked) {
                    g._phoneIndexChecked = true;
                    try {
                        const db = connection.db;
                        if (db) {
                            const indexes = await db.collection("users").indexes();
                            const phoneIndex = indexes.find((i) => i.name === "phone_1");
                            if (phoneIndex && (!phoneIndex.sparse || !phoneIndex.unique)) {
                                console.log("[connectDb] Dropping legacy non-sparse/non-unique phone_1 index to recreate as sparse unique.");
                                await db.collection("users").dropIndex("phone_1");
                            }
                        }
                    } catch (idxErr) {
                        console.warn("[connectDb] Phone index check failed (can ignore if first run):", idxErr);
                    }
                }

        return globalCache.conn;
    } catch (error) {
        globalCache.promise = null; // Reset so future attempts can retry
        console.error("Database connection failed:", error);
        throw new Error("Database connection failed");
    }
};

export default connectDb;