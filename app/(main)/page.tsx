import { Container } from "@/app/components/ui/Container";
import { Button } from "@/app/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import dbConnect from "@/lib/db";
import Note from "@/models/Note";
import Collaboration from "@/models/Collaboration";
import { NewsletterForm } from "@/app/components/NewsletterForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Subscriber from "@/models/Subscriber";
import { Code, Database, Cpu, Network, BookOpen, ChevronRight, FileText, Users, ArrowRight } from "lucide-react";

// Fetch notes for the study materials section
async function getLandingData() {
  try {
    await dbConnect();
    const now = new Date();
    const publishedFilter = {
      $or: [
        { status: "published" },
        { status: "scheduled", scheduledPublishDate: { $lte: now } },
      ],
    };

    // IMPORTANT: In Next.js serverless/dev environments, we must ensure the models
    // are registered in Mongoose BEFORE we try to populate them in queries.
    const Subject = (await import("@/models/Subject")).default;
    const Post = (await import("@/models/Post")).default;
    const Category = (await import("@/models/Category")).default;

    let notes = await Note.find(publishedFilter)
      .sort({ createdAt: -1 })
      .limit(4)
      .populate("subject", "name slug")
      .lean();

    let subjects = await Subject.find().sort({ name: 1 }).limit(4).lean();
    
    let featuredBlogs = await Post.find(publishedFilter)
      .sort({ featured: -1, createdAt: -1 })
      .limit(4)
      .populate("category", "name")
      .select("title slug excerpt image category createdAt readTime")
      .lean();

    let collaborations = await Collaboration.find({ status: "published" })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate("student", "name")
      .lean();

    return {
      latest: notes.map((n: any) => ({
        ...n,
        _id: n._id.toString(),
        category: n.subject?.name || "Uncategorized",
        subjectSlug: n.subject?.slug || "",
        createdAt: n.createdAt.toISOString(),
      })),
      subjects: subjects.map((s: any) => ({
        ...s,
        _id: s._id.toString()
      })),
      blogs: featuredBlogs.map((b: any) => ({
        _id: b._id.toString(),
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt,
        image: b.image,
        category: b.category?.name || "General",
        createdAt: b.createdAt.toISOString(),
        readTime: b.readTime || "5 min read",
      })),
      collaborations: collaborations.map((c: any) => ({
        _id: c._id.toString(),
        slug: c.slug,
        title: c.title,
        type: c.type,
        image: c.image || null,
        event: c.event,
        student: c.student?.name || "Unknown"
      }))
    };
  } catch (error) {
    console.error("Error fetching landing data:", error);
    return { latest: [], subjects: [], blogs: [], collaborations: [] };
  }
}

export const revalidate = 60; // Revalidate every minute

export default async function LandingPage() {
  const { latest, subjects, blogs, collaborations } = await getLandingData();

  // Check session for newsletter pre-filling
  const session = await getServerSession(authOptions);
  let initialEmail = "";
  let isSubscribed = false;

  if (session?.user?.email) {
    initialEmail = session.user.email;
    await dbConnect();
    const sub = await Subscriber.findOne({ email: initialEmail });
    if (sub) {
      isSubscribed = true;
    }
  }

  return (
    <div className="bg-[#050505] min-h-screen text-zinc-300 font-sans selection:bg-accent/30 selection:text-white">
      {/* 1. Hero Section */}
      <section className="relative pt-36 pb-32 md:pt-48 md:pb-48 border-b border-white/5 overflow-hidden">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="z-10 order-2 lg:order-1">
              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-serif font-medium text-white tracking-tight leading-[1.1] mb-8">
                Welcome to the world <br />
                <span className="italic text-accent">of Computer Science.</span>
              </h1>

              <p className="text-lg md:text-xl text-zinc-300 font-light leading-relaxed max-w-xl mb-12">
                A comprehensive academic hub where students and learners can dive deep into complex concepts, clear their doubts, and master the fundamentals of software engineering.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/courses">
                  <Button
                    size="lg"
                    className="rounded-full text-base font-medium px-8 bg-accent text-black hover:bg-accent-hover transition-colors h-12 w-full sm:w-auto"
                  >
                    Explore Materials <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/research">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full text-base font-medium px-8 border-white/20 hover:bg-white/10 transition-all h-12 w-full sm:w-auto"
                  >
                    View Research
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative order-1 lg:order-2 h-[400px] md:h-[500px] w-full rounded-2xl overflow-hidden border border-accent/20 shadow-2xl shadow-accent/10 group">
              <div className="absolute inset-0 bg-gradient-to-tr from-background/40 via-transparent to-transparent z-10 pointer-events-none"></div>
              <Image
                src="/images/cs_abstract_hero.png"
                alt="Computer Science Abstract"
                fill
                className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000 ease-in-out"
                priority
              />
            </div>
          </div>

          {/* Background Glow */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-accent rounded-full blur-[150px] -z-10 pointer-events-none opacity-[0.15] mix-blend-screen"></div>
        </Container>
      </section>

      {/* 2. Learning Paths (Replaces Topics Strip) */}
      <section className="py-24 relative" id="learning-paths">
        <Container>
          <div className="mb-16">
            <h2 className="text-sm font-mono text-accent uppercase tracking-widest mb-3">// Core Curriculum</h2>
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-white">Learning Paths</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {subjects.length > 0 ? subjects.map((path: any) => {
              const Icon = path.icon === 'Database' ? Database : 
                           path.icon === 'Code' ? Code : 
                           path.icon === 'Network' ? Network : 
                           path.icon === 'Cpu' ? Cpu : BookOpen;
              return (
                <Link key={path._id} href={`/courses/${path.slug}`} className="group block">
                  <div className="h-full p-6 rounded-xl border border-white/5 bg-[#0a0a0a] hover:border-accent/50 transition-all duration-300 relative overflow-hidden">
                    {/* Hover Glow */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/10 rounded-full blur-[30px] group-hover:bg-accent/20 transition-all duration-500"></div>
                    
                    <Icon className="w-8 h-8 text-zinc-500 group-hover:text-accent mb-6 transition-colors" />
                    <h4 className="text-lg font-bold text-white mb-2 font-serif">{path.name}</h4>
                    <p className="text-sm text-zinc-500 font-sans">{path.description}</p>
                    
                    <div className="mt-6 flex items-center text-xs font-mono text-accent opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      Start Learning <ChevronRight className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                </Link>
              )
            }) : (
                <div className="col-span-full py-10 text-center text-zinc-500 font-mono text-sm border border-dashed border-white/10 rounded-xl">
                    No subjects found. Add subjects in Writers Hub.
                </div>
            )}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/courses">
                <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full text-base font-medium px-8 border-white/20 hover:bg-white/10 transition-all h-12"
                >
                    Browse All Courses
                </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* 3. Study Hub (Terminal / Docs Style) */}
      <section className="py-24 bg-[#0a0a0a] border-y border-white/5">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
               <h2 className="text-sm font-mono text-accent uppercase tracking-widest mb-3">// Latest Notes</h2>
               <h3 className="text-3xl md:text-4xl font-serif font-bold text-white">Study Hub</h3>
            </div>
            <Link
              href="/courses"
              className="group flex items-center text-sm font-mono text-zinc-400 hover:text-accent transition-colors"
            >
              [ View All Materials ]
            </Link>
          </div>

          <div className="bg-[#050505] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            {/* Fake Window Header */}
            <div className="flex items-center px-4 py-3 border-b border-white/10 bg-[#0a0a0a]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-zinc-800"></div>
                <div className="w-3 h-3 rounded-full bg-zinc-800"></div>
                <div className="w-3 h-3 rounded-full bg-zinc-800"></div>
              </div>
              <div className="mx-auto text-xs font-mono text-zinc-500">~/cswithbs/latest-notes</div>
            </div>
            
            {/* Content List */}
            <div className="divide-y divide-white/5">
              {latest.length > 0 ? latest.map((post: any, index: number) => (
                <Link
                  key={post._id}
                  href={post.subjectSlug ? `/courses/${post.subjectSlug}/${post.slug}` : `#`}
                  className="flex flex-col md:flex-row md:items-center gap-4 p-6 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="text-xs font-mono text-zinc-600 md:w-12 shrink-0">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-zinc-200 group-hover:text-accent transition-colors mb-1">
                      {post.title}
                    </h4>
                    <p className="text-sm text-zinc-500 line-clamp-1">{post.excerpt}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono text-zinc-400 uppercase">
                      {post.category}
                    </span>
                    <span className="text-xs font-mono text-zinc-600 hidden sm:block">
                      {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}
                    </span>
                  </div>
                </Link>
              )) : (
                <div className="p-12 text-center text-sm font-mono text-zinc-600">
                  No materials found in the repository.
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* 3.5. Featured Blogs Section */}
      <section className="py-24" id="featured-blogs">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
               <h2 className="text-sm font-mono text-accent uppercase tracking-widest mb-3">// Insights & Updates</h2>
               <h3 className="text-3xl md:text-4xl font-serif font-bold text-white">Featured Articles</h3>
            </div>
            <Link
              href="/blog"
              className="group flex items-center text-sm font-mono text-zinc-400 hover:text-accent transition-colors"
            >
              [ View All Articles ]
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {blogs.length > 0 ? blogs.map((post: any) => (
              <Link 
                key={post._id} 
                href={`/blog/${post.slug}`}
                className="group flex flex-col bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden hover:border-accent/30 transition-all duration-300 relative"
              >
                {/* Glowing Hover Effect */}
                <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/5 transition-colors z-0 pointer-events-none"></div>

                {/* Cover Image */}
                <div className="relative h-48 w-full overflow-hidden shrink-0 z-10">
                  <Image
                    src={post.image || "/images/cs_abstract_hero.png"}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
                  <div className="absolute top-4 left-4 z-20">
                     <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-mono text-white uppercase tracking-wider">
                       {post.category}
                     </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1 z-10">
                  <div className="flex items-center gap-3 text-xs font-mono text-zinc-500 mb-4">
                    <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}</span>
                    <span>&bull;</span>
                    <span>{post.readTime}</span>
                  </div>
                  
                  <h4 className="text-xl font-bold text-white mb-3 font-serif group-hover:text-accent transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  
                  <p className="text-sm text-zinc-400 font-sans line-clamp-3 mb-6 flex-1">
                    {post.excerpt}
                  </p>
                  
                  <div className="mt-auto flex items-center text-xs font-mono text-accent opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    Read Article <ChevronRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </Link>
            )) : (
              <div className="col-span-full py-16 text-center text-zinc-500 font-mono text-sm border border-dashed border-white/10 rounded-xl">
                No articles published yet.
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* 3.75 Student Collaborations Highlight */}
      {collaborations.length > 0 && (
      <section className="py-24" id="student-collaborations">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
               <h2 className="text-sm font-mono text-accent uppercase tracking-widest mb-3">// Student Showcase</h2>
               <h3 className="text-3xl md:text-4xl font-serif font-bold text-white">Collaborative Research</h3>
            </div>
            <Link
              href="/research/collaborations"
              className="group flex items-center text-sm font-mono text-zinc-400 hover:text-accent transition-colors"
            >
              [ View All Projects ]
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collaborations.map((project: any) => (
              <Link 
                key={project.slug} 
                href={`/research/collaborations/${project.slug}`}
                className="group flex flex-col bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden hover:border-accent/30 transition-all duration-300 relative"
              >
                {/* Glowing Hover Effect */}
                <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/5 transition-colors z-0 pointer-events-none"></div>

                {/* Cover Image or Empty State */}
                <div className="relative h-48 w-full overflow-hidden shrink-0 z-10 flex items-center justify-center bg-[#050505]">
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a] group-hover:bg-white/[0.02] transition-colors">
                       <FileText size={48} className="text-zinc-700" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
                  <div className="absolute top-4 left-4 z-20">
                     <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-mono text-white uppercase tracking-wider">
                       {project.type}
                     </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1 z-10">
                  <div className="flex items-center gap-3 text-xs font-mono text-zinc-500 mb-4">
                    <span>{project.event}</span>
                    <span>&bull;</span>
                    <span>{project.student}</span>
                  </div>
                  
                  <h4 className="text-lg font-bold text-white mb-3 font-serif group-hover:text-accent transition-colors line-clamp-2">
                    {project.title}
                  </h4>
                  
                  <div className="mt-auto flex items-center text-xs font-mono text-accent opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pt-4">
                    View Project <ChevronRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
      )}

      {/* 4. Publications & Research */}
      <section className="py-24 bg-[#0a0a0a] border-y border-white/5" id="publications">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="mb-16">
              <h2 className="text-sm font-mono text-accent uppercase tracking-widest mb-3">// Academic Work</h2>
              <h3 className="text-3xl md:text-4xl font-serif font-bold text-white">Recent Publications</h3>
            </div>

            <div className="space-y-4">
              {[
                {
                  id: 1,
                  title: "A Comprehensive Survey on Artificial Hummingbird Algorithm and its Applications",
                  journal: "Archives of Computational Methods in Engineering",
                  year: "2023",
                  link: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=qE2uisoAAAAJ&citation_for_view=qE2uisoAAAAJ:N5tVd3kTz84C",
                },
                {
                  id: 2,
                  title: "Reptile Search Algorithm: Theory, variants and applications",
                  journal: "Swarm and Evolutionary Computation",
                  year: "2024",
                  link: "https://link.springer.com/article/10.1007/s11831-023-09990-1",
                },
                {
                  id: 3,
                  title: "Mango leaf disease classification using deep learning techniques: a comprehensive review",
                  journal: "Multimedia Tools and Applications",
                  year: "2023",
                  link: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=qE2uisoAAAAJ&citation_for_view=qE2uisoAAAAJ:__bU50VfleQC",
                }
              ].map((pub) => (
                <a key={pub.id} href={pub.link} target="_blank" rel="noopener noreferrer" className="block p-6 rounded-xl border border-white/5 bg-[#0a0a0a] hover:border-accent/30 hover:bg-[#0f0f0f] transition-all group relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-zinc-100 mb-2 leading-snug group-hover:text-accent transition-colors">
                        {pub.title}
                      </h4>
                      <p className="text-sm text-zinc-400 font-sans">Published in {pub.journal} &middot; {pub.year}</p>
                    </div>
                    <div className="shrink-0 flex items-start">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/10 text-zinc-500 group-hover:text-accent group-hover:border-accent/50 transition-colors">
                          <FileText className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </a>
              ))}
              
              <div className="mt-8 text-center">
                <Link href="/research" className="inline-flex items-center gap-2 text-sm font-mono text-zinc-400 hover:text-accent transition-colors">
                  [ View All Publications ] <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 5. Minimal Quote Section */}
      <section className="py-24 border-y border-white/5 bg-[#0a0a0a]">
         <Container>
            <div className="max-w-3xl mx-auto text-center">
               <BookOpen className="w-8 h-8 text-accent/50 mx-auto mb-8" />
               <h3 className="text-2xl md:text-3xl font-serif text-white font-medium leading-relaxed mb-6">
                  "Computer science is no more about computers than astronomy is about telescopes. It is about understanding the fundamental laws of computation and logic."
               </h3>
               <p className="text-sm font-mono text-accent uppercase tracking-widest">
                  — Edsger W. Dijkstra
               </p>
            </div>
         </Container>
      </section>

      {/* 6. Newsletter / Updates */}
      <section className="py-32 relative overflow-hidden">
        <Container className="relative z-10 max-w-xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">Stay Updated</h2>
          <p className="text-zinc-400 mb-8 font-sans">
            Subscribe to receive notifications when new course materials, lecture notes, or research papers are published. No spam, ever.
          </p>
          <div className="max-w-md mx-auto">
            <NewsletterForm
              initialEmail={initialEmail}
              isSubscribed={isSubscribed}
            />
          </div>
        </Container>
        {/* Glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[100px] pointer-events-none"></div>
      </section>
    </div>
  );
}
