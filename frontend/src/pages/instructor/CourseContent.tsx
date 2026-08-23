import { useEffect, useState, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourseSections } from '../../api/course';
import { createSection, createLesson } from '../../api/instructor';
import type { Section } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import FolderTree from '../../components/course/FolderTree';

// flattened list of every folder, at any nesting depth, for the folder/lecture forms' dropdowns
function flattenFolders(sections: Section[], prefix = ''): { id: number; label: string }[] {
  return sections.flatMap((section) => {
    const label = prefix ? `${prefix} / ${section.title}` : section.title;
    return [{ id: section.id, label }, ...flattenFolders(section.children, label)];
  });
}

export default function CourseContent() {
  const { courseId } = useParams();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [folderTitle, setFolderTitle] = useState('');
  const [parentId, setParentId] = useState('');

  const [lessonTitle, setLessonTitle] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [isReq, setIsReq] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    load(Number(courseId));
  }, [courseId]);

  async function load(id: number) {
    setLoading(true);
    const data = await getCourseSections(id);
    setSections(data);
    setLoading(false);
  }

  const allFolders = flattenFolders(sections);

  async function handleAddFolder(e: FormEvent) {
    e.preventDefault();
    if (!courseId || !folderTitle) return;
    setError('');
    try {
      await createSection({
        courseId: Number(courseId),
        title: folderTitle,
        parentId: parentId ? Number(parentId) : undefined,
      });
      setFolderTitle('');
      setParentId('');
      load(Number(courseId));
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'could not create the folder');
    }
  }

  async function handleAddLesson(e: FormEvent) {
    e.preventDefault();
    if (!courseId || !lessonTitle || !contentUrl || !sectionId) return;
    setError('');
    try {
      await createLesson({
        sectionId: Number(sectionId),
        title: lessonTitle,
        contentUrl,
        isReq,
      });
      setLessonTitle('');
      setContentUrl('');
      load(Number(courseId));
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'could not add the lecture');
    }
  }

  if (loading) return <p className="p-6 text-slate-500">loading...</p>;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Course content</h1>
        <Link to={`/courses/${courseId}`}>
          <Button size="sm" variant="outline">
            View course page
          </Button>
        </Link>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="mb-8">
        {sections.length === 0 ? (
          <p className="text-sm text-slate-500">No folders yet, add one below to get started.</p>
        ) : (
          <FolderTree sections={sections} />
        )}
      </div>

      <Card className="mb-6">
        <h2 className="mb-3 text-sm font-medium text-slate-900">
          Add a folder (e.g. "Week 1", or "Frontend" nested under "Week 1")
        </h2>
        <form onSubmit={handleAddFolder} className="flex flex-col gap-3">
          <Input
            label="Folder name"
            required
            value={folderTitle}
            onChange={(e) => setFolderTitle(e.target.value)}
          />
          <Select
            label="Nest inside (optional)"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          >
            <option value="">No parent, top level folder</option>
            {allFolders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.label}
              </option>
            ))}
          </Select>
          <Button type="submit" size="sm">
            Add folder
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-medium text-slate-900">Add a lecture</h2>
        {allFolders.length === 0 ? (
          <p className="text-sm text-slate-500">Add a folder first, then you can add lectures to it.</p>
        ) : (
          <form onSubmit={handleAddLesson} className="flex flex-col gap-3">
            <Select label="Folder" required value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
              <option value="">Select a folder</option>
              {allFolders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.label}
                </option>
              ))}
            </Select>
            <Input
              label="Lecture title"
              required
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
            />
            <Input
              label="YouTube video URL"
              type="url"
              required
              placeholder="https://www.youtube.com/watch?v=..."
              value={contentUrl}
              onChange={(e) => setContentUrl(e.target.value)}
            />
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={isReq} onChange={(e) => setIsReq(e.target.checked)} />
              Required lecture
            </label>
            <Button type="submit" size="sm">
              Add lecture
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
