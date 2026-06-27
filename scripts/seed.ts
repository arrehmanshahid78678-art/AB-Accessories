/* CLI seed entrypoint — run with:  npx tsx scripts/seed.ts */
import { ensureSeedData } from "@/lib/seed";

ensureSeedData()
  .then(() => {
    console.log("✅ AB Accessories: seed completed successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ AB Accessories: seed failed:", err);
    process.exit(1);
  });
