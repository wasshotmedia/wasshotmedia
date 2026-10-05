import { getSession, type SessionUser } from "@/lib/auth";
import { connectDb, isMongoConnected } from "@/lib/db";
import { errorJson } from "@/lib/utils";
import { ActivityLog } from "@/models";
import { localStore } from "@/lib/local-store";

export async function requireUser(): Promise<
  | { session: SessionUser; response: null }
  | { session: null; response: Response }
> {
  const session = await getSession();
  if (!session) {
    return { session: null, response: errorJson("Unauthorized", 401) };
  }
  await connectDb();
  return { session, response: null };
}

export async function logActivity(
  session: SessionUser,
  action: string,
  entityType?: string,
  entityId?: string,
  meta?: unknown,
  ip?: string,
) {
  try {
    if (isMongoConnected()) {
      await ActivityLog.create({
        actorId: session.id,
        action,
        entityType,
        entityId,
        meta,
        ip,
      });
    } else {
      localStore.logActivity(action, entityType, entityId, meta, session.name);
    }
  } catch {
    localStore.logActivity(action, entityType, entityId, meta, session.name);
  }
}

export function lean<T>(doc: T) {
  return JSON.parse(JSON.stringify(doc)) as T;
}
