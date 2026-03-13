// import { pgView as view } from "drizzle-orm/pg-core";
// import users from "../tables/users";

// export const user_view = view("user_view").as((qb) =>
//   qb
//     .select({
//       id: users.id,
//       email: users.email,
//       phone: users.phone,
//       username: users.username,
//       pfp_hash: users.pfp_hash,
//       timestamp: users.timestamp,
//     })
//     .from(users),
// );