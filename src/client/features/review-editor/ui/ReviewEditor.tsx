import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

type Props = {
  initialHtml: string;
  onChange: (html: string) => void;
};

export function ReviewEditor(props: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: props.initialHtml,
    editorProps: {
      attributes: {
        class:
          "min-h-[220px] rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-neutral-600",
      },
    },
    onUpdate: ({ editor }) => {
      props.onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(props.initialHtml);
  }, [editor, props.initialHtml]);

  if (!editor) {
    return (
      <div className="min-h-[220px] rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-500">
        Loading editor…
      </div>
    );
  }

  return <EditorContent editor={editor} />;
}
