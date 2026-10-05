import mongoose from "mongoose";

type GlobalMongoose = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
  failedBefore?: boolean;
};

const globalForMongoose = globalThis as unknown as {
  mongooseCache?: GlobalMongoose;
};

const cache: GlobalMongoose = globalForMongoose.mongooseCache ?? {
  conn: null,
  promise: null,
  failedBefore: false,
};

globalForMongoose.mongooseCache = cache;

export async function connectDb(): Promise<typeof mongoose | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return null;
  }

  // If already connected, return connection
  if (cache.conn && mongoose.connection.readyState === 1) {
    return cache.conn;
  }

  // If failed before in this process, skip waiting on unreachable remote cluster
  if (cache.failedBefore) {
    return null;
  }

  if (!cache.promise) {
    cache.promise = (async () => {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("MongoDB connection timeout")), 1200)
        );

        const connectPromise = mongoose.connect(uri, {
          bufferCommands: false,
          serverSelectionTimeoutMS: 1200,
          connectTimeoutMS: 1200,
        });

        const conn = await Promise.race([connectPromise, timeoutPromise]);
        cache.conn = conn;
        return conn;
      } catch (err: any) {
        cache.failedBefore = true;
        cache.conn = null;
        console.warn(
          "[Database] MongoDB Atlas unreachable or not whitelisted. Seamlessly running in ultra-fast local store mode."
        );
        return null;
      }
    })();
  }

  return cache.promise;
}

export function isMongoConnected(): boolean {
  return Boolean(cache.conn && mongoose.connection.readyState === 1);
}

export function isDbConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI);
}
