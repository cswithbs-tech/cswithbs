import { Metadata } from 'next';
import { Container } from '@/app/components/ui/Container';
import dbConnect from '@/lib/db';
import Gallery from '@/models/Gallery';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Gallery | CSWITHBS',
  description: 'Explore the moments, events, and highlights at CSWITHBS.',
};

export const revalidate = 60; // Revalidate every 60 seconds

export default async function GalleryPage() {
  await dbConnect();
  
  // Fetch active gallery items
  const galleryItems = await Gallery.find({ isActive: true })
    .sort({ order: 1, createdAt: -1 })
    .lean();

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-24 selection:bg-accent/30 selection:text-accent-foreground">
      <Container>
        <div className="max-w-3xl mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white font-display tracking-tight mb-4">
            Our <span className="text-accent">Gallery</span>
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed">
            A collection of moments, events, and highlights from the CSWITHBS community.
          </p>
        </div>

        {galleryItems.length === 0 ? (
          <div className="text-center py-20 bg-[#111111] rounded-3xl border border-white/5">
            <p className="text-zinc-500 font-medium">No images have been added to the gallery yet.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {galleryItems.map((item: any) => (
              <div 
                key={item._id.toString()} 
                className="group relative break-inside-avoid rounded-2xl overflow-hidden bg-[#111111] border border-white/10"
              >
                <Image
                  src={item.imageUrl}
                  alt={item.title || 'Gallery image'}
                  width={600}
                  height={800} // This is just for aspect ratio calculation, actual height will depend on width
                  className="w-full h-auto object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                  unoptimized
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out flex flex-col justify-end p-6">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
                    {item.title && (
                      <h3 className="text-white font-bold text-lg mb-1 drop-shadow-md">
                        {item.title}
                      </h3>
                    )}
                    {item.description && (
                      <p className="text-sm text-zinc-300 line-clamp-3 drop-shadow-md">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
