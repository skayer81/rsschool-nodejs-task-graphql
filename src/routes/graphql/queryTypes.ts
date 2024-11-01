import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { PrismaClient } from '@prisma/client';
import { UUID } from 'crypto';
import DataLoader from 'dataloader';
type Prisma = {
  prisma: PrismaClient;
};

export const MemberTypeIdEnum = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    BASIC: { value: 'BASIC' },
    BUSINESS: { value: 'BUSINESS' },
  },
});

export const MemberType: GraphQLObjectType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: { type: GraphQLString },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
    profiles: { type: new GraphQLList(ProfileType) },
  }),
});

export const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: GraphQLString },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: GraphQLString },
  }),
});

export const UserType: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: { type: ProfileType },
    posts: {
      type: new GraphQLList(PostType),
      //   posts: {
      //     type: new GraphQLList(PostType),
      //  posts: {
      //  type: new GraphQLList(PostType),
      // resolve: async (source, _, context, info) => {
      //   const authorId = source.id;
      //   console.log(`Загружаем посты для автора с id: ${authorId}`);
      //   const posts = await context.dataloaders.postLoader.load(authorId);
      //   console.log('Загруженные посты:', posts);
      //   return posts;
      // },
      resolve: async (source, _, context, info) => {
        const id = source.id;

        return await context.dataloaders.postLoader.load(id);
      },
      //   resolve: async (source, _, context, info) => {
      //     const posts = await context.prisma.post.findMany({
      //       where: { authorId: source.id },
      //     });
      //     return posts;
      //   },
    },

    //   },

    //   resolve: async (source, _, context, info) => {
    //     const { dataloaders } = context;
    //     const id = source.id;
    //     let dl = dataloaders.get(info.fieldNodes);

    //     if (!dl) {
    //       dl = new DataLoader(async (ids) => {
    //         //  const posts = await context.prisma.post.findMany({ where: { authorId: id } });
    //         const posts = await context.prisma.post.findMany({
    //           where: { authorId: { in: ids } },
    //         });
    //         const sortedInIdsOrder = ids.map((id) => posts.find((x) => x.id === id));
    //         return sortedInIdsOrder;
    //       });
    //       dataloaders.set(info.fieldNodes, dl);
    //     }
    //     return dl.load(id);
    //   },

    // posts: {
    //  type: new GraphQLList(PostType),
    //   resolve: async (source, _, context, info) => {
    //     const { dataloaders } = context;
    //     const id = source.id;

    //       //     let dl = dataloaders.get(info.fieldNodes);

    //     if (!dl) {
    //       dl = new DataLoader(async (ids) => {
    //         const posts = await context.prisma.post.findMany({
    //           where: { authorId: { in: ids } },
    //         });

    //            //         const postsById = {};
    //         posts.forEach((post) => {
    //           postsById[post.authorId] = post;
    //         });

    //         return ids.map((id) => postsById[id as UUID] || null);
    //       });

    //       dataloaders.set(info.fieldNodes, dl);
    //     }

    //
    //     return dl.load(id);
    //   },
    //   //   },
    // },

    // resolve2: async (source, _, context, info) => {
    //   const { dataloaders } = context;
    //   const id = source.id;
    //   let dl = dataloaders.get(info.fieldNodes);

    //   if (!dl) {
    //     dl = new DataLoader(async (ids) => {
    //       const posts = await context.prisma.post.findMany({
    //         where: { authorId: { in: ids } },
    //       });
    //       const sortedInIdsOrder = ids.map((id) => posts.find((x) => x.id === id));
    //       return sortedInIdsOrder;
    //     });
    //     dataloaders.set(info.fieldNodes, dl);
    //   }

    //
    //   return dl.load(id);
    // },

    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async (source, _, context, info) => {
        //  const { dataloaders } = context;
        const id = source.id;
        return await context.dataloaders.userSubscribedToLoader.load(id);
        // if (!dataloaders.userSubscribedToLoader) {
        //   dataloaders.userSubscribedToLoader = createUserSubscribedToLoader(
        //     context.prisma,
        //   );
        // }

        //  return dataloaders.userSubscribedToLoader.load(id);
      },
      // resolve: async (source, args, context, info) => {
      //     const id = source.id;
      //     return await context.dataloaders.subscribedToUserLoader.load(id);
      //   },
      //   resolve: async (user: { id: UUID }, _, { prisma }: Prisma) => {
      //     const subscriptions = await prisma.subscribersOnAuthors.findMany({
      //       where: { subscriberId: user.id },
      //       include: {
      //         author: true,
      //       },
      //     });
      //     return subscriptions.map((sub) => sub.author);
      //   },

      //   resolve: async (user: { id: UUID }, _, { prisma }: Prisma) => {
      //     const subscriptions = await prisma.subscribersOnAuthors.findMany({
      //       where: { subscriberId: user.id },
      //       include: {
      //         author: true,
      //       },
      //     });
      //     return subscriptions.map((sub) => sub.author);
      //   },
      //   resolve: (source, args, context, info) => {
      //     const { dataloaders } = context;
      //     const id = source.id;

      //     let dl = dataloaders.get(info.fieldNodes);
      //     if (!dl) {
      //       dl = new DataLoader(async (ids) => {
      //         const subscriptions = await context.prisma.subscribersOnAuthors.findMany({
      //           where: { subscriberId: { in: ids } },
      //           include: {
      //             author: true,
      //           },
      //         });

      //         const subscriptionsMap = new Map();
      //         subscriptions.forEach((sub) => {
      //           if (!subscriptionsMap.has(sub.subscriberId)) {
      //             subscriptionsMap.set(sub.subscriberId, []);
      //           }
      //           subscriptionsMap.get(sub.subscriberId).push(sub.author);
      //         });

      //         return ids.map((id) => subscriptionsMap.get(id) || []);
      //       });

      //       dataloaders.set(info.fieldNodes, dl);
      //     }

      //     return dl.load(id);
      //   },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async (source, args, context, info) => {
        const id = source.id;
        return await context.dataloaders.subscribedToUserLoader.load(id);
      },

      //   resolve: async (user: { id: UUID }, _, { prisma }: Prisma) => {
      //     const subscriptions = await prisma.subscribersOnAuthors.findMany({
      //       where: { authorId: user.id },
      //       include: {
      //         subscriber: true,
      //       },
      //     });
      //     return subscriptions.map((sub) => sub.subscriber);
      //   },

      //   resolve: async (source, _, context, info) => {
      //     const id = source.memberTypeId;

      //     return await context.dataloaders.memberTypeLoader.load(id);
      //   },
      //   resolve: async (user: { id: UUID }, _, { prisma }: Prisma) => {
      //     const subscriptions = await prisma.subscribersOnAuthors.findMany({
      //       where: { authorId: user.id },
      //       include: {
      //         subscriber: true,
      //       },
      //     });
      //     return subscriptions.map((sub) => sub.subscriber);
      //   },
      //   resolve: (source, args, context, info) => {
      //     const { dataloaders } = context;
      //     const id = source.id;

      //     let dl = dataloaders.get(info.fieldNodes);
      //     if (!dl) {
      //       dl = new DataLoader(async (ids) => {
      //         const subscriptions = await context.prisma.subscribersOnAuthors.findMany({
      //           where: { authorId: { in: ids } },
      //           include: {
      //             subscriber: true,
      //           },
      //         });

      //         const subscriptionsMap = new Map();
      //         subscriptions.forEach((sub) => {
      //           if (!subscriptionsMap.has(sub.authorId)) {
      //             subscriptionsMap.set(sub.authorId, []);
      //           }
      //           subscriptionsMap.get(sub.authorId).push(sub.subscriber);
      //         });

      //         return ids.map((id) => subscriptionsMap.get(id) || []);
      //       });

      //       dataloaders.set(info.fieldNodes, dl);
      //     }

      //     return dl.load(id);
      //   },
    },
  }),
});

export const SubscribersOnAuthorsType = new GraphQLObjectType({
  name: 'SubscribersOnAuthors',
  fields: () => ({
    subscriberId: { type: GraphQLString },
    authorId: { type: GraphQLString },
    author: {
      type: UserType,
      resolve: async (
        user: { authorId: UUID; subscriberId: UUID },
        _,
        { prisma }: Prisma,
      ) => {
        return await prisma.user.findUnique({
          where: { id: user.authorId },
        });
      },
    },
    subscribedToUser: { type: GraphQLFloat },
    subscriber: {
      type: UserType,
      resolve: async (
        user: { authorId: UUID; subscriberId: UUID },
        _,
        { prisma }: Prisma,
      ) => {
        return await prisma.user.findUnique({
          where: { id: user.subscriberId },
        });
      },
    },
  }),
});

export const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: GraphQLString },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    userId: { type: GraphQLString },

    memberType: {
      type: MemberType,
      //   resolve: async (profile: { memberTypeId: UUID }, _, { prisma }: Prisma) => {
      //     const memberType = await prisma.memberType.findUnique({
      //       where: { id: profile.memberTypeId },
      //     });
      //     return memberType;
      //   },
      resolve: async (source, _, context, info) => {
        const id = source.memberTypeId;

        return await context.dataloaders.memberTypeLoader.load(id);
      },
    },
    memberTypeId: { type: MemberTypeIdEnum },
  }),
});
