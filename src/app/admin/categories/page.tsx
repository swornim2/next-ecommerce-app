import { AddCategoryForm } from "@/components/admin/AddCategoryForm"
import { CategoryList } from "@/components/admin/CategoryList"

export default function AdminCategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div>
          <h1 className="text-2xl font-bold mb-8">Add New Category</h1>
          <AddCategoryForm />
        </div>
        
        <div>
          <CategoryList />
        </div>
      </div>
    </div>
  )
}
