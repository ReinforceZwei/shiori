import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import IndexClientComponent from "@/lib/component/index/IndexClientComponent/IndexClientComponent";

export default async function IndexPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/signin")
  }

  return (
    <IndexClientComponent session={session} />
  );
}