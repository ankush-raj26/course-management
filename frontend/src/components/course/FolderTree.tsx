import { useState } from 'react';
import type { Lesson, Section } from '../../types';
import { getYouTubeEmbedUrl } from '../../lib/youtube';
import Card from '../ui/Card';

function LessonRow({ lesson }: { lesson: Lesson }) {
  const [playing, setPlaying] = useState(false);
  const embedUrl = getYouTubeEmbedUrl(lesson.contentUrl);

  return (
    <li className="py-1">
      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        className="text-left text-slate-700 hover:text-slate-900 hover:underline"
      >
        🎬 {lesson.title}
        {!lesson.isReq && <span className="ml-1 text-xs text-slate-400">(optional)</span>}
      </button>

      {playing &&
        (embedUrl ? (
          <div className="mt-2 aspect-video max-w-md overflow-hidden rounded-lg border border-slate-200">
            <iframe
              key={embedUrl}
              src={embedUrl}
              title={lesson.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <p className="mt-1 text-xs text-slate-400">
            not a youtube link -{' '}
            <a href={lesson.contentUrl} target="_blank" rel="noreferrer" className="underline">
              open it directly
            </a>
          </p>
        ))}
    </li>
  );
}

function FolderNode({ section, depth }: { section: Section; depth: number }) {
  const [open, setOpen] = useState(false);
  const hasContent = section.lessons.length > 0 || section.children.length > 0;

  return (
    <div className={depth > 0 ? 'mt-3 ml-4 border-l border-slate-100 pl-4' : ''}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 font-medium text-slate-900"
      >
        <span className="text-slate-400">{open ? '▾' : '▸'}</span>
        {open ? '📂' : '📁'} {section.title}
      </button>

      {open && (
        <div className="mt-2">
          {!hasContent && <p className="ml-6 text-xs text-slate-400">empty folder</p>}

          {section.lessons.length > 0 && (
            <ul className="ml-6 list-none text-sm text-slate-600">
              {section.lessons.map((lesson) => (
                <LessonRow key={lesson.id} lesson={lesson} />
              ))}
            </ul>
          )}

          {section.children.map((child) => (
            <FolderNode key={child.id} section={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// recursive folder/file browser for course content: click a folder to expand it,
// click a lecture to play its youtube video inline
export default function FolderTree({ sections }: { sections: Section[] }) {
  if (sections.length === 0) {
    return <p className="text-sm text-slate-500">No content has been added to this course yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {sections.map((section) => (
        <Card key={section.id}>
          <FolderNode section={section} depth={0} />
        </Card>
      ))}
    </div>
  );
}
