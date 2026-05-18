import { useEffect, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
} from "lexical"
import { $insertList } from "@lexical/list"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  RotateCcw,
  RotateCw,
  Strikethrough,
  Underline,
} from "lucide-react"

import { ContentEditable } from "@/components/editor/editor-ui/content-editable"
import { Button } from "@/components/ui/button"

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const [active, setActive] = useState({
    bold: false,
    italic: false,
    underline: false,
    strike: false,
  })
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  useEffect(() => {
    const unregisterUpdate = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) {
          setActive({ bold: false, italic: false, underline: false, strike: false })
          return
        }

        setActive({
          bold: selection.hasFormat("bold"),
          italic: selection.hasFormat("italic"),
          underline: selection.hasFormat("underline"),
          strike: selection.hasFormat("strikethrough"),
        })
      })
    })

    const unregisterCanUndo = editor.registerCommand<boolean>(
      CAN_UNDO_COMMAND,
      (payload) => {
        setCanUndo(payload)
        return false
      },
      COMMAND_PRIORITY_LOW,
    )

    const unregisterCanRedo = editor.registerCommand<boolean>(
      CAN_REDO_COMMAND,
      (payload) => {
        setCanRedo(payload)
        return false
      },
      COMMAND_PRIORITY_LOW,
    )

    return () => {
      unregisterUpdate()
      unregisterCanUndo()
      unregisterCanRedo()
    }
  }, [editor])

  return (
    <div className="flex flex-wrap items-center gap-1 border-b px-2 py-2">
      <Button
        type="button"
        size="icon-xs"
        variant="outline"
        disabled={!canUndo}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
      >
        <RotateCcw />
      </Button>
      <Button
        type="button"
        size="icon-xs"
        variant="outline"
        disabled={!canRedo}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
      >
        <RotateCw />
      </Button>
      <Button
        type="button"
        size="icon-xs"
        variant={active.bold ? "secondary" : "outline"}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
      >
        <Bold />
      </Button>
      <Button
        type="button"
        size="icon-xs"
        variant={active.italic ? "secondary" : "outline"}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
      >
        <Italic />
      </Button>
      <Button
        type="button"
        size="icon-xs"
        variant={active.underline ? "secondary" : "outline"}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
      >
        <Underline />
      </Button>
      <Button
        type="button"
        size="icon-xs"
        variant={active.strike ? "secondary" : "outline"}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}
      >
        <Strikethrough />
      </Button>
      <Button
        type="button"
        size="icon-xs"
        variant="outline"
        onClick={() =>
          editor.update(() => {
            $insertList("bullet")
          })
        }
      >
        <List />
      </Button>
      <Button
        type="button"
        size="icon-xs"
        variant="outline"
        onClick={() =>
          editor.update(() => {
            $insertList("number")
          })
        }
      >
        <ListOrdered />
      </Button>
    </div>
  )
}

export function Plugins({ placeholder = "Start typing ..." }: { placeholder?: string }) {
  return (
    <div className="relative">
      {/* toolbar plugins */}
      <div className="relative">
        <ToolbarPlugin />
        <RichTextPlugin
          contentEditable={
            <div className="">
              <div className="">
                <ContentEditable placeholder={placeholder} />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        {/* editor plugins */}
      </div>
      {/* actions plugins */}
    </div>
  )
}
