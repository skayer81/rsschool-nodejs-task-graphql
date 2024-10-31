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
    posts: { type: new GraphQLList(PostType) },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: (source, args, context, info) => {
        const { dataloaders } = context;
        const id = source.id;

        let dl = dataloaders.get(info.fieldNodes);
        if (!dl) {
          dl = new DataLoader(async (ids) => {
            const subscriptions = await context.prisma.subscribersOnAuthors.findMany({
              where: { subscriberId: { in: ids } },
              include: {
                author: true,
              },
            });

            const subscriptionsMap = new Map();
            subscriptions.forEach((sub) => {
              if (!subscriptionsMap.has(sub.subscriberId)) {
                subscriptionsMap.set(sub.subscriberId, []);
              }
              subscriptionsMap.get(sub.subscriberId).push(sub.author);
            });

            return ids.map((id) => subscriptionsMap.get(id) || []);
          });

          dataloaders.set(info.fieldNodes, dl);
        }

        return dl.load(id);
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async (user: { id: UUID }, _, { prisma }: Prisma) => {
        const subscriptions = await prisma.subscribersOnAuthors.findMany({
          where: { authorId: user.id },
          include: {
            subscriber: true,
          },
        });
        return subscriptions.map((sub) => sub.subscriber);
      },
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
      resolve: async (profile: { memberTypeId: UUID }, _, { prisma }: Prisma) => {
        const memberType = await prisma.memberType.findUnique({
          where: { id: profile.memberTypeId },
        });
        return memberType;
      },
    },
    memberTypeId: { type: MemberTypeIdEnum },
  }),
});
