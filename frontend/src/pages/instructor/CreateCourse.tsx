import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { createCourse } from '../../api/course';
import { getCategories } from '../../api/category';
import { userAtom } from '../../store/userAtom';
import type { Category } from '../../types';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

export default function CreateCourse() {
  const user = useRecoilValue(userAtom);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getCategories().then((data) => {
      setCategories(data);
      if (data[0]) setCategoryId(String(data[0].id));
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError('');

    try {
      const res = await createCourse({
        instructorId: user.id,
        categoryId: Number(categoryId),
        title,
        description,
      });
      navigate(`/courses/${res.createdCourse.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'could not create the course');
    }
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Create a course</h1>

      {categories.length === 0 ? (
        <p className="text-sm text-slate-500">
          No category exists yet, ask an admin to create one first.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea
            label="Description"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Select label="Category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </Select>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit">Create course</Button>
        </form>
      )}
    </div>
  );
}
