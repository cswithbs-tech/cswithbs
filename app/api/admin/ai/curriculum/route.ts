import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Subject from "@/models/Subject";
import Chapter from "@/models/Chapter";
import Note from "@/models/Note";

// Standard canonical university computer science modules for gap analysis
const CANONICAL_SYLLABUS_TOPICS: Record<string, string[]> = {
  "Operating Systems": [
    "Process Lifecycle & State Transitions",
    "CPU Scheduling Algorithms (FCFS, SJF, Round Robin)",
    "Process Synchronization & Critical Section Problem",
    "Deadlock Avoidance & Banker's Algorithm",
    "Memory Management: Paging & Virtual Memory",
    "Page Replacement Algorithms (FIFO, LRU, Optimal)",
    "File System Structure & Allocation Methods",
  ],
  "Database Management Systems": [
    "Entity-Relationship (ER) Modeling & Relational Schema",
    "Functional Dependencies & Normalization (1NF, 2NF, 3NF, BCNF)",
    "Relational Algebra & SQL Query Optimization",
    "ACID Properties & Transaction States",
    "Concurrency Control: Two-Phase Locking (2PL)",
    "Serializability & Conflict Equivalence",
    "Indexing Strategies: B-Trees & B+ Trees",
  ],
  "Data Structures & Algorithms": [
    "Asymptotic Notation & Time Complexity Proofs",
    "Dynamic Arrays & Linked List Variations",
    "Stack & Queue Implementations with Applications",
    "Binary Trees & BST Balanced Traversals",
    "Graph Algorithms: BFS, DFS, Dijkstra, Bellman-Ford",
    "Dynamic Programming: 0/1 Knapsack & LCS",
    "Sorting Algorithms: QuickSort & MergeSort In-Depth",
  ],
  "Computer Networks": [
    "OSI 7-Layer Architecture vs TCP/IP Protocol Suite",
    "Data Link Framing, Error Detection (CRC) & Flow Control",
    "Sliding Window Protocols (Go-Back-N & Selective Repeat)",
    "IP Addressing & Subnetting (CIDR & VLSM)",
    "Routing Protocols: Distance Vector (RIP) vs Link State (OSPF)",
    "Transport Layer: TCP 3-Way Handshake & Congestion Control",
    "Application Layer: DNS, HTTP/3, and SSL/TLS Handshake",
  ],
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRoles = (session.user as any)?.roles || [];
    const isAuthorized = Array.isArray(userRoles)
      ? userRoles.some((r: string) => ["ADMIN", "SUPER_ADMIN", "admin", "super_admin"].includes(r))
      : ["ADMIN", "SUPER_ADMIN", "admin", "super_admin"].includes(userRoles);

    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    await dbConnect();

    const [subjects, chapters, notes] = await Promise.all([
      Subject.find().sort({ name: 1 }).lean(),
      Chapter.find().sort({ order: 1 }).lean(),
      Note.find().select("title slug subject chapter order status").lean(),
    ]);

    // Build subject-chapter-note tree
    const curriculum = subjects.map((subj: any) => {
      const subjChapters = chapters.filter((c: any) => String(c.subject) === String(subj._id));
      
      const chaptersWithNotes = subjChapters.map((chap: any) => {
        const chapNotes = notes.filter((n: any) => String(n.chapter) === String(chap._id));
        return {
          id: chap._id.toString(),
          name: chap.name,
          slug: chap.slug,
          order: chap.order || 0,
          notesCount: chapNotes.length,
          notes: chapNotes.map((n: any) => ({
            id: n._id.toString(),
            title: n.title,
            slug: n.slug,
            order: n.order || 0,
            status: n.status,
          })),
        };
      });

      const totalSubjNotes = notes.filter((n: any) => String(n.subject) === String(subj._id)).length;
      
      // Calculate missing canonical topics for this subject
      const canonical = CANONICAL_SYLLABUS_TOPICS[subj.name] || [];
      const existingTitlesLower = notes
        .filter((n: any) => String(n.subject) === String(subj._id))
        .map((n: any) => n.title.toLowerCase());

      const missingTopics = canonical.filter((topic) => {
        const topicWords = topic.toLowerCase().split(" ");
        // If none of the key words match an existing title
        return !existingTitlesLower.some((t: string) =>
          topicWords.filter((w) => w.length > 3).some((w) => t.includes(w))
        );
      });

      return {
        id: subj._id.toString(),
        name: subj.name,
        slug: subj.slug,
        level: subj.level,
        color: subj.color || "#06b6d4",
        icon: subj.icon || "BookOpen",
        totalChapters: subjChapters.length,
        totalNotes: totalSubjNotes,
        chapters: chaptersWithNotes,
        missingTopics,
      };
    });

    return NextResponse.json({
      curriculum,
      totalSubjects: subjects.length,
      totalChapters: chapters.length,
      totalNotes: notes.length,
    });
  } catch (error: any) {
    console.error("Error fetching curriculum for AI Studio:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch curriculum" }, { status: 500 });
  }
}

// POST: AI Curriculum Actions
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRoles = (session.user as any)?.roles || [];
    const isAuthorized = Array.isArray(userRoles)
      ? userRoles.some((r: string) => ["ADMIN", "SUPER_ADMIN", "admin", "super_admin"].includes(r))
      : ["ADMIN", "SUPER_ADMIN", "admin", "super_admin"].includes(userRoles);

    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { action } = body;

    const {
      generateCurriculumSubjectPlan,
      generateMissingChaptersForSubject,
      generateNotesOutlineForChapter,
    } = await import("@/lib/ai");

    // 1. Generate full curriculum subject plan
    if (action === "create_subject_plan") {
      const { topic, level } = body;
      if (!topic) return NextResponse.json({ error: "topic is required" }, { status: 400 });
      const plan = await generateCurriculumSubjectPlan(topic, level);
      return NextResponse.json({ success: true, plan });
    }

    // 2. Audit missing chapters for a subject
    if (action === "suggest_chapters") {
      const { subjectName, existingChapters, level } = body;
      if (!subjectName) return NextResponse.json({ error: "subjectName is required" }, { status: 400 });
      const result = await generateMissingChaptersForSubject(
        subjectName,
        Array.isArray(existingChapters) ? existingChapters : [],
        level
      );
      return NextResponse.json({ success: true, ...result });
    }

    // 3. Generate note outline for a chapter
    if (action === "suggest_notes") {
      const { subjectName, chapterName } = body;
      if (!subjectName || !chapterName) {
        return NextResponse.json({ error: "subjectName and chapterName are required" }, { status: 400 });
      }
      const result = await generateNotesOutlineForChapter(subjectName, chapterName);
      return NextResponse.json({ success: true, ...result });
    }

    // 4. Batch seed chapters into MongoDB
    if (action === "seed_chapters") {
      const { subjectId, chapters: incomingChapters } = body;
      if (!subjectId || !Array.isArray(incomingChapters) || incomingChapters.length === 0) {
        return NextResponse.json({ error: "subjectId and chapters array required" }, { status: 400 });
      }

      await dbConnect();
      const subject = await Subject.findById(subjectId);
      if (!subject) return NextResponse.json({ error: "Subject not found" }, { status: 404 });

      // Find current max order
      const existingChapters = await Chapter.find({ subject: subjectId }).sort({ order: -1 }).limit(1);
      let nextOrder = existingChapters.length > 0 ? (existingChapters[0].order || 0) + 1 : 1;

      const createdChapters = [];
      for (const chap of incomingChapters) {
        const baseSlug = (chap.slug || chap.name)
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-");

        let uniqueSlug = `${subject.slug}-${baseSlug}`;
        let counter = 1;
        while (await Chapter.findOne({ slug: uniqueSlug })) {
          uniqueSlug = `${subject.slug}-${baseSlug}-${counter++}`;
        }

        const newChap = await Chapter.create({
          name: chap.name,
          slug: uniqueSlug,
          subject: subjectId,
          order: chap.order || nextOrder++,
          description: chap.description || "",
        });
        createdChapters.push(newChap);
      }

      return NextResponse.json({ success: true, count: createdChapters.length, chapters: createdChapters });
    }

    // 5. Create new Subject and auto-seed its chapters
    if (action === "create_subject_with_chapters") {
      const { plan } = body;
      if (!plan || !plan.name) {
        return NextResponse.json({ error: "plan is required" }, { status: 400 });
      }

      await dbConnect();
      let baseSlug = plan.slug || plan.name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-");
      let uniqueSlug = baseSlug;
      let counter = 1;
      while (await Subject.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${baseSlug}-${counter++}`;
      }

      const newSubject = await Subject.create({
        name: plan.name,
        slug: uniqueSlug,
        description: plan.description || "",
        level: plan.level || "All Levels",
        alignments: plan.alignments || ["Computer Science"],
        color: "#3b82f6",
        icon: "BookOpen",
      });

      const createdChapters = [];
      if (Array.isArray(plan.suggestedChapters)) {
        for (let i = 0; i < plan.suggestedChapters.length; i++) {
          const chap = plan.suggestedChapters[i];
          const chapSlugBase = chap.name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-");
          let chapSlug = `${uniqueSlug}-${chapSlugBase}`;
          let cCount = 1;
          while (await Chapter.findOne({ slug: chapSlug })) {
            chapSlug = `${uniqueSlug}-${chapSlugBase}-${cCount++}`;
          }

          const createdChap = await Chapter.create({
            name: chap.name,
            slug: chapSlug,
            subject: newSubject._id,
            order: chap.order || i + 1,
            description: chap.description || "",
          });
          createdChapters.push(createdChap);
        }
      }

      return NextResponse.json({
        success: true,
        subject: newSubject,
        chaptersCount: createdChapters.length,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in AI curriculum POST handler:", error);
    return NextResponse.json({ error: error.message || "Failed to process curriculum action" }, { status: 500 });
  }
}

