import { getCategories } from "@/lib/data";
import { CategoryManager } from "@/components/admin/CategoryManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Categories</h1>
        <p className="text-sm text-slate-500">{categories.length} categories</p>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
