import { AddCategoryForm } from "@/components/admin/AddCategoryForm"

export default function AdminCategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Add New Category</h1>
        <AddCategoryForm />
      </div>
    </div>
  )
}
