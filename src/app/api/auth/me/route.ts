import { api } from "@/server/http";
import { currentUser } from "@/server/auth";
import { hasDb } from "@/server/db";

export const GET = api(async () => {
  const user = hasDb() ? await currentUser() : null;
  return { user, db: hasDb() };
});
