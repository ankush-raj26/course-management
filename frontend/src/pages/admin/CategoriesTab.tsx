import { useEffect, useState, type FormEvent } from 'react';
import { getCategories } from '../../api/category';
import { createCategory } from '../../api/admin';
import type { Category } from '../../types';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    getCategories()
      .then(setCategories)
      .finally(() => setLoading(false));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await createCategory(title);
    setTitle('');
    load();
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <Input
          placeholder="New category name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="sm">
          Add
        </Button>
      </form>

      {loading ? (
        <p className="text-slate-500">loading...</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Card key={category.id} className="px-3 py-1.5 text-sm text-slate-700">
              {category.title}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
