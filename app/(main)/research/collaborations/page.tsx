import dbConnect from "@/lib/db";
import Collaboration from "@/models/Collaboration";
import CollaborationsGallery from "./CollaborationsGallery";
import User from "@/models/User";

export const metadata = {
  title: "Student Collaborations | CSwithBS Research",
  description: "Showcasing collaborative research work from our talented students.",
};

export const revalidate = 60; // revalidate every minute

export default async function CollaborationsGalleryPage() {
  await dbConnect();
  
  // Need to register User model to populate
  if (typeof User === "undefined") {
    // Should be initialized by dbConnect or import
  }

  const data = await Collaboration.find({ status: "published" })
    .populate("student", "name email image username")
    .sort({ createdAt: -1 })
    .lean();
    
  // Format for client
  const serializedData = data.map((item: any) => ({
    ...item,
    _id: item._id.toString(),
    student: item.student ? {
      _id: item.student._id.toString(),
      name: item.student.name,
      email: item.student.email,
      image: item.student.image,
      username: item.student.username || item.student.name.replace(/\s+/g, "").toLowerCase()
    } : null,
    createdAt: item.createdAt?.toISOString(),
    updatedAt: item.updatedAt?.toISOString(),
  }));

  return <CollaborationsGallery initialData={serializedData} />;
}
