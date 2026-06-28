'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { useEffect } from 'react'
import { Bold, Italic, List, ListOrdered, Table2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: placeholder || 'Escribe aquí...' }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  if (!editor) return null

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden focus-within:border-primary transition-colors">
      <div className="flex gap-1 p-1.5 bg-muted/20 border-b border-border/30 flex-wrap">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn('w-8 h-8 rounded flex items-center justify-center hover:bg-muted transition-colors', editor.isActive('bold') && 'bg-muted')}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn('w-8 h-8 rounded flex items-center justify-center hover:bg-muted transition-colors', editor.isActive('italic') && 'bg-muted')}
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-border/50 mx-1 self-center" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn('w-8 h-8 rounded flex items-center justify-center hover:bg-muted transition-colors', editor.isActive('bulletList') && 'bg-muted')}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn('w-8 h-8 rounded flex items-center justify-center hover:bg-muted transition-colors', editor.isActive('orderedList') && 'bg-muted')}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-border/50 mx-1 self-center" />
        <button
          type="button"
          onClick={addTable}
          className={cn('w-8 h-8 rounded flex items-center justify-center hover:bg-muted transition-colors', editor.isActive('table') && 'bg-muted')}
          title="Insertar tabla"
        >
          <Table2 className="w-4 h-4" />
        </button>
        {editor.isActive('table') && (
          <>
            <button
              type="button"
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              className="w-8 h-8 rounded flex items-center justify-center hover:bg-muted transition-colors text-xs font-bold"
              title="Columna antes"
            >Col-</button>
            <button
              type="button"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="w-8 h-8 rounded flex items-center justify-center hover:bg-muted transition-colors text-xs font-bold"
              title="Columna después"
            >Col+</button>
            <button
              type="button"
              onClick={() => editor.chain().focus().addRowBefore().run()}
              className="w-8 h-8 rounded flex items-center justify-center hover:bg-muted transition-colors text-xs font-bold"
              title="Fila antes"
            >Row-</button>
            <button
              type="button"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="w-8 h-8 rounded flex items-center justify-center hover:bg-muted transition-colors text-xs font-bold"
              title="Fila después"
            >Row+</button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="w-8 h-8 rounded flex items-center justify-center hover:bg-rose-500/10 text-rose-500 transition-colors"
              title="Eliminar tabla"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[120px] focus:outline-none
          [&_.ProseMirror]:outline-none
          [&_.ProseMirror_p]:my-1
          [&_.ProseMirror_ul]:pl-5
          [&_.ProseMirror_ol]:pl-5
          [&_.ProseMirror_table]:w-full
          [&_.ProseMirror_table]:border-collapse
          [&_.ProseMirror_table]:my-2
          [&_.ProseMirror_th]:border
          [&_.ProseMirror_th]:border-border/50
          [&_.ProseMirror_th]:bg-muted/30
          [&_.ProseMirror_th]:px-3
          [&_.ProseMirror_th]:py-2
          [&_.ProseMirror_th]:text-left
          [&_.ProseMirror_th]:font-bold
          [&_.ProseMirror_th]:text-sm
          [&_.ProseMirror_td]:border
          [&_.ProseMirror_td]:border-border/50
          [&_.ProseMirror_td]:px-3
          [&_.ProseMirror_td]:py-2
          [&_.ProseMirror_td]:text-sm"
      />
    </div>
  )
}
