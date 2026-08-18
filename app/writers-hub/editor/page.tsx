import UniversalEditor from "@/app/writers-hub/components/editor/UniversalEditor";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import Note from "@/models/Note";

export default async function UnifiedEditorPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/writers-hub/login");
  }

  const userRoles = (session.user as any)?.roles || [];
  const isWriter = userRoles.includes("WRITER");
  const isAdmin = userRoles.includes("ADMIN") || userRoles.includes("SUPER_ADMIN");

  if (!isWriter && !isAdmin) {
    redirect("/admin/unauthorized");
  }

  let typeParam = typeof searchParams.type === 'string' ? searchParams.type : 'post';
  if (!isAdmin && typeParam === 'note') {
    // Regular writers cannot write notes. Fallback to post.
    typeParam = 'post';
  }
  const contentType = typeParam === 'note' ? 'note' : 'post';
  const id = typeof searchParams.id === 'string' ? searchParams.id : null;

  let initialData = null;
  const isEdit = !!id;

  if (isEdit) {
    await dbConnect();
    
    if (contentType === 'note') {
      const note = await Note.findById(id).lean();
      if (note) {
        initialData = {
          ...note,
          _id: note._id.toString(),
          author: note.author ? note.author.toString() : "",
          subject: note.subject ? note.subject.toString() : "",
          chapter: note.chapter ? note.chapter.toString() : "",
          createdAt: note.createdAt?.toISOString(),
          updatedAt: note.updatedAt?.toISOString(),
        };
      }
    } else {
      const post = await Post.findById(id).lean();
      if (post) {
        initialData = {
          ...post,
          _id: post._id.toString(),
          author: post.author ? post.author.toString() : "",
          category: post.category ? post.category.toString() : "",
          createdAt: post.createdAt?.toISOString(),
          updatedAt: post.updatedAt?.toISOString(),
          scheduledPublishDate: post.scheduledPublishDate?.toISOString() || "",
        };
      }
    }
  }



  return (
    <UniversalEditor
      initialData={initialData}
      isEdit={isEdit}
      contentType={contentType}
    />
  );
}
