import { requireUser, auth } from "@/lib/auth";
import { headers } from "next/headers";
import ApiKeySettings from "./ApiKeySettings";


export default async function ApiKeySection() {
  const apiKeys = await auth.api.listApiKeys({
    headers: await headers(),
  });
  
  return <ApiKeySettings apiKeys={apiKeys} />;
}