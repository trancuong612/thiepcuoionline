import { redirect } from "@remix-run/node";
import { requireAdmin } from "../lib/auth.server";
import { cleanupCloudinaryAssets } from "../lib/cloudinary-cleanup.server";

export async function loader() {
  throw new Response("Method Not Allowed", { status: 405 });
}

export async function action({ request }) {
  await requireAdmin(request);

  await cleanupCloudinaryAssets();

  return redirect("/admin?cleanup=1");
}
