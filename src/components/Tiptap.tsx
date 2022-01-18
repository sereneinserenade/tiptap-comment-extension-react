// src/Tiptap.jsx
import * as React from 'react'
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import format from 'date-fns/format';
import './Tiptap.scss'
import { Comment } from './extensions/comment'
import { v4 as uuidv4 } from 'uuid'

const dateTimeFormat = 'dd.MM.yyyy HH:mm';

interface CommentInstance {
  uuid?: string
  comments?: any[]
}

const Tiptap = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Comment
    ],
    content: '<p>I\'m trying to make comment extension, so you<span data-comment="{&quot;uuid&quot;:&quot;cc3d6027-4500-484e-a26a-146371c210ff&quot;,&quot;comments&quot;:[{&quot;userName&quot;:&quot;sereneinserenade&quot;,&quot;time&quot;:1639256036089,&quot;content&quot;:&quot;Talking with myself&quot;},{&quot;userName&quot;:&quot;sereneinserenade&quot;,&quot;time&quot;:1639256052643,&quot;content&quot;:&quot;Actually no, I am making a video/demo for you guys&quot;},{&quot;userName&quot;:&quot;sereneinserenade&quot;,&quot;time&quot;:1639256065012,&quot;content&quot;:&quot;And there you go&quot;}]}"> can add comm</span>ent here ☮️ and see how it goes. Add a comment <span data-comment="{&quot;uuid&quot;:&quot;a077d444-2c4d-4ccf-958b-8f3fcc33dd27&quot;,&quot;comments&quot;:[{&quot;userName&quot;:&quot;sereneinserenade&quot;,&quot;time&quot;:1639256014964,&quot;content&quot;:&quot;A new world of comments&quot;},{&quot;userName&quot;:&quot;sereneinserenade&quot;,&quot;time&quot;:1639256023904,&quot;content&quot;:&quot;Ah, so the last of us 2 is out&quot;},{&quot;userName&quot;:&quot;sereneinserenade&quot;,&quot;time&quot;:1639256027778,&quot;content&quot;:&quot;Yes, it is&quot;},{&quot;userName&quot;:&quot;sereneinserenade&quot;,&quot;time&quot;:1639256059546,&quot;content&quot;:&quot;Ah some more&quot;}]}">HERE.</span></p>',
    onUpdate({ editor }) {
      findCommentsAndStoreValues();

      setCurrentComment(editor);
    },

    onSelectionUpdate({ editor }) {
      setCurrentComment(editor);

      setIsTextSelected(!!editor.state.selection.content().size)
    },

    editorProps: {
      attributes: {
        spellcheck: 'false',
      },
    },
  })

  const [isCommentModeOn, setIsCommentModeOn] = React.useState(false)

  const [currentUserName, setCurrentUserName] = React.useState('sereneinserenade');

  const [commentText, setCommentText] = React.useState('');

  const [showCommentMenu, setShowCommentMenu] = React.useState(false);

  const [isTextSelected, setIsTextSelected] = React.useState(false);

  const [showAddCommentSection, setShowAddCommentSection] = React.useState(true);

  const formatDate = (d: any) => (d ? format(new Date(d), dateTimeFormat) : null);

  const [activeCommentsInstance, setActiveCommentsInstance] = React.useState<CommentInstance>({});

  const [allComments, setAllComments] = React.useState<any[]>([]);

  const findCommentsAndStoreValues = () => {
    const proseMirror = document.querySelector('.ProseMirror');

    const comments = proseMirror?.querySelectorAll('span[data-comment]');

    const tempComments: any[] = [];

    if (!comments) {
      setAllComments([])
      return;
    }

    comments.forEach((node) => {
      const nodeComments = node.getAttribute('data-comment');

      const jsonComments = nodeComments ? JSON.parse(nodeComments) : null;

      if (jsonComments !== null) {
        tempComments.push({
          node,
          jsonComments,
        });
      }
    });

    setAllComments(tempComments)
  };

  const setCurrentComment = (editor: any) => {
    const newVal = editor.isActive('comment');

    if (newVal) {
      setTimeout(() => setShowCommentMenu(newVal), 50);

      setShowAddCommentSection(!editor.state.selection.empty)

      const parsedComment = JSON.parse(editor.getAttributes('comment').comment);

      parsedComment.comment = typeof parsedComment.comments === 'string' ? JSON.parse(parsedComment.comments) : parsedComment.comments;

      setActiveCommentsInstance(parsedComment)
    } else {
      setActiveCommentsInstance({})
    }
  };

  const setComment = () => {
    if (!commentText.trim().length) return;

    const activeCommentInstance: CommentInstance = JSON.parse(JSON.stringify(activeCommentsInstance));

    const commentsArray = typeof activeCommentInstance.comments === 'string' ? JSON.parse(activeCommentInstance.comments) : activeCommentInstance.comments;

    if (commentsArray) {
      commentsArray.push({
        userName: currentUserName,
        time: Date.now(),
        content: commentText,
      });

      const commentWithUuid = JSON.stringify({
        uuid: activeCommentsInstance.uuid || uuidv4(),
        comments: commentsArray,
      });

      // eslint-disable-next-line no-unused-expressions
      editor?.chain().setComment(commentWithUuid).run();
    } else {
      const commentWithUuid = JSON.stringify({
        uuid: uuidv4(),
        comments: [{
          userName: currentUserName,
          time: Date.now(),
          content: commentText,
        }],
      });

      // eslint-disable-next-line no-unused-expressions
      editor?.chain().setComment(commentWithUuid).run();
    }

    setTimeout(() => setCommentText(''), 50);
  };


  const toggleCommentMode = () => {
    setIsCommentModeOn(!isCommentModeOn)

    if (isCommentModeOn) editor?.setEditable(false);
    else editor?.setEditable(true);
  };

  const { log } = console

  React.useEffect((): any => setTimeout(findCommentsAndStoreValues, 100), []);

  return (
    <main className="flex flex-row tiptap">
      <section className="tiptap-container w-2/3">
        <section className="buttons-section">
          <button
            onClick={() => toggleCommentMode()}
            type="button"
            className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded shadow-lg"
          >
            {isCommentModeOn ? "Comment mode ON" : "Comment mode OFF"}
          </button>

          <button
            onClick={() => log(editor?.getHTML())}
            type="button"
            className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded shadow-lg"
          >
            HTML to Console
          </button>
        </section>

        {editor && <BubbleMenu
          tippy-options={{ duration: 100, placement: 'bottom' }}
          editor={editor}
          className="bubble-menu"
        // shouldShow={() => (isCommentModeOn && isTextSelected && !activeCommentsInstance.uuid)}
        >
          <section className="comment-adder-section bg-white shadow-lg" >
            <textarea
              value={commentText}
              onInput={(e) => setCommentText((e.target as any).value)}
              onKeyPress={(e) => {
                if (e.keyCode === 13) {
                  e.preventDefault()
                  e.stopPropagation()
                  setComment()
                }
              }}
              cols={30}
              rows={4}
              placeholder="Add comment..."
              className="border-none outline-none"
            />

            <section className="flex flex-row w-full gap-1">
              <button
                className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded shadow-lg w-1/3"
                onClick={() => setCommentText('')} >
                Clear
              </button>

              <button
                className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded shadow-lg w-2/3"
                onClick={() => setComment()}
              >
                Add
              </button>
            </section>
          </section>
        </BubbleMenu>}

        <EditorContent className="editor-content" editor={editor} />
      </section>

      <section className="flex flex-col">
        {
          allComments.map((comment, i) => {
            return (
              <article
                className={`comment external-comment shadow-lg my-2 bg-gray-100 transition-all rounded-md overflow-hidden ${comment.jsonComments.uuid === activeCommentsInstance.uuid ? 'ml-4' : 'ml-8'}`}
                key={i + 'external_comment'}
              >
                {
                  comment.jsonComments.comments.map((jsonComment: any, j: number) => {
                    return (
                      <article
                        key={`${j}_${Math.random()}`}
                        className="external-comment border-b-2 border-gray-200 p-3"
                      >
                        <div className="comment-details">
                          <strong>{jsonComment.userName}</strong>

                          <span className="ml-1 date-time text-xs">{formatDate(jsonComment.time)}</span>
                        </div>

                        <span className="content">{jsonComment.content}</span>
                      </article>
                    )
                  })
                }

                {comment.jsonComments.uuid === activeCommentsInstance.uuid && <section className="flex flex-col w-full gap-1">
                  <textarea
                    value={commentText}
                    onInput={(e) => setCommentText((e.target as any).value)}
                    onKeyPress={(e) => {
                      if (e.keyCode === 13) {
                        e.preventDefault()
                        e.stopPropagation()
                        setComment()
                      }
                    }}
                    cols={30}
                    rows={4}
                    placeholder="Add comment..."
                    className="border-none outline-none"
                  />

                  <section className="flex flex-row w-full gap-1">
                    <button
                      className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded-lg shadow-lg w-1/3"
                      onClick={() => setCommentText('')}
                    >
                      Clear
                    </button>

                    <button
                      className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded-lg shadow-lg w-2/3"
                      onClick={() => setComment()}
                    >
                      Add (<kbd className="">Ent</kbd>)
                    </button>
                  </section>
                </section>
                }
              </article>
            )
          }
          )
        }
      </section>
    </main>
  )
}

export default Tiptap
