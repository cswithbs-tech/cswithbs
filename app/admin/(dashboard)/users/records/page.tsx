import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";
import Comment from "@/models/Comment";
import { UserRecordRowActions } from "../../../components/UserRecordRowActions";
import { UserAvatarModal } from "../../../components/UserAvatarModal";
import { AdminSearch } from "../../../components/AdminSearch";
import { UserFilter } from "../../../components/UserFilter";
import { Pagination } from "@/app/components/ui/Pagination";
import Link from "next/link";
import { Button } from "@/app/components/ui/Button";

export const revalidate = 0; // Always fresh

async function getUsers(
  page: number,
  limit: number,
  query: string,
  role?: string,
  sortBy?: string,
  order?: string,
) {
  await dbConnect();
  const skip = (page - 1) * limit;

  const dbQuery: any = {};

  if (query) {
    const searchRegex = new RegExp(query, "i");
    dbQuery.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  if (role && role !== "all") {
    if (role.toLowerCase() === 'premium') {
      dbQuery.$or = dbQuery.$or || [];
      // Combine with existing $or if search is active
      if (dbQuery.$or.length > 0) {
        dbQuery.$and = [
          { $or: dbQuery.$or },
          { $or: [{ isPremium: true }, { roles: { $in: ['PREMIUM'] } }, { roles: { $in: ['SUPER_ADMIN'] } }] }
        ];
        delete dbQuery.$or;
      } else {
        dbQuery.$or = [{ isPremium: true }, { roles: { $in: ['PREMIUM'] } }, { roles: { $in: ['SUPER_ADMIN'] } }];
      }
    } else {
      dbQuery.roles = { $in: [role.toUpperCase()] };
    }
  }

  const totalUsers = await User.countDocuments(dbQuery);
  const totalPages = Math.ceil(totalUsers / limit);

  let sortQuery: any = { createdAt: 1 }; // default: oldest first (date asc)
  const dir = order === 'desc' ? -1 : 1;
  if (sortBy === 'name') sortQuery = { name: dir };
  else sortQuery = { createdAt: dir };

  const users = await User.find(dbQuery)
    .sort(sortQuery)
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    users: users.map((u: any) => ({
      _id: u._id.toString(),
      name: u.name,
      email: u.email,
      image: u.image,
      roles: u.roles || [],
      isPremium: u.isPremium || false,
      location: u.location,
      occupation: u.occupation,
      university: u.university,
      semester: u.semester,
      year: u.year,
      isCourseRestricted: u.isCourseRestricted || false,
      createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
    })),
    totalPages,
  };
}

export default async function UserRecordsPage(props: {
  searchParams: Promise<{
    page?: string;
    query?: string;
    role?: string;
    sort?: string;
    sortBy?: string;
    order?: string;
    limit?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const query = searchParams.query || "";
  const role = searchParams.role || "all";
  const sortBy = searchParams.sortBy || "date";
  const order = searchParams.order || "asc"; // default: oldest first
  const limit = Number(searchParams.limit) || 10;

  const session = await getServerSession(authOptions);
  const currentUser = session?.user as any;
  const isSuperOrAdmin =
    currentUser?.roles?.includes('ADMIN') || currentUser?.roles?.includes('SUPER_ADMIN');

  if (!isSuperOrAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-zinc-400">
        Access Denied
      </div>
    );
  }

  const { users, totalPages } = await getUsers(page, limit, query, role, sortBy, order);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-8 font-sans selection:bg-accent/30">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-white font-display tracking-tight">
            User Records & Identity
          </h1>
          <p className="text-sm text-zinc-400">
            View users' academic and professional records at a glance.
          </p>
        </div>
        {/* Only show Add User if valid (usually not manual, but here for UI consistency) */}
        <Link href="/admin/users/create">
          <Button
            variant="primary"
            className="gap-2 bg-accent hover:bg-accent text-black border-0 shadow-[0_0_15px_rgba(234,179,8,0.3)] font-semibold"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add User
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <AdminSearch placeholder="Search name or email..." />
            <UserFilter />
          </div>
          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-zinc-500 whitespace-nowrap">
            <span>Showing {users.length} users</span>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#111] border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    User Details
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Occupation
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Institution
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Semester
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Location
                  </th>



                  <th className="px-6 py-4 text-xs font-semibold text-zinc-300 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {users.map((user: any) => (
                  <tr
                    key={user._id}
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <UserAvatarModal imageSrc={user.image} name={user.name} />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 ring-2 ring-white/5 shadow-sm">
                            {(user.name && user.name[0]) || "?"}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-zinc-100 group-hover:text-accent transition-colors">
                            {user.name}
                          </span>
                          <span className="text-xs text-zinc-500 font-medium">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wider bg-zinc-800/50 text-zinc-300 border-zinc-700/50 uppercase">
                        {user.occupation || "Student"}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <span className="text-sm text-zinc-300 font-medium">
                        {user.university || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <div className="flex flex-col">
                        <span className="text-sm text-zinc-300 font-medium">
                          {user.semester ? `Sem: ${user.semester}` : "-"}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                          {user.year ? `Class of ${user.year}` : "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <span className="text-sm text-zinc-300 font-medium">
                        {user.location || "-"}
                      </span>
                    </td>

                    <td className="px-6 py-4 align-middle text-right">
                      <UserRecordRowActions
                        userId={user._id.toString()}
                        isCourseRestricted={user.isCourseRestricted || false}
                        userName={user.name}
                        roles={user.roles || []}
                      />
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-zinc-500 font-medium"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-white/5 bg-white/[0.02]">
            <Pagination 
              totalPages={totalPages} 
              showLimitSelector={true} 
              currentLimit={limit}
              limitOptions={[10, 20, 50, 100]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
