import {
  graphql,
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
//import { PrismaClient } from '@prisma/client';
import { UUIDType } from './types/uuid.js';
import {
  MemberType,
  MemberTypeIdEnum,
  PostType,
  ProfileType,
  UserType,
} from './queryTypes.js';
import { PrismaClient } from '@prisma/client';

type Prisma = {
  prisma: PrismaClient;
};

export const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    memberTypes: {
      type: new GraphQLList(MemberType),
      resolve: async (_, __, { prisma }: Prisma) => {
        return await prisma.memberType.findMany({});
      },
    },
    memberType: {
      type: MemberType,
      args: {
        id: { type: MemberTypeIdEnum },
      },
      resolve: async (_, { id }, { prisma }) => {
        //  console.log('+++++++++++++++ ++++++++++++ memberType');
        const memberType = await prisma.memberType.findUnique({
          where: { id: id as string },
        });
        return memberType;
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: async (_, __, { prisma }) => {
        return await prisma.post.findMany();
      },
    },
    post: {
      type: PostType,
      args: {
        id: { type: UUIDType },
      },
      resolve: async (_, { id }, { prisma }) => {
        //     console.log('+++++++++++++++ ++++++++++++ post');
        const post = await prisma.post.findUnique({
          where: { id: id as string },
        });
        return post;
      },
    },
    users: {
      type: new GraphQLList(UserType),
      resolve: async (_, __, { prisma }: Prisma) => {
        //  if (!prisma.user) return;
        const result = await prisma.user.findMany({
          include: {
            profile: {
              include: {
                memberType: true,
              },
            },
            posts: true,
          },
        });
        return result;
      },
    },
    user: {
      type: UserType,
      args: {
        id: { type: UUIDType },
      },
      resolve: async (_, { id }, { prisma }) => {
        //     console.log('++++++++++++++++++++++user');
        // const user = await prisma.user.findUnique({
        //   where: { id: id as string },
        // });
        const user = await prisma.user.findUnique({
          where: { id: id as string },
          include: {
            profile: {
              include: {
                memberType: true,
              },
            },
            posts: true,
            userSubscribedTo: {
              include: {
                // subscribedToUser: true,
                subscriber: true,
              },
            },
            subscribedToUser: {
              include: {
                // userSubscribedTo: true,
                author: true,
              },
            },
          },
        });
        //    console.log('++++++++++++++++++++++user');
        //    console.log(user);
        //    console.log('++++++++++++++++++++++user конец');
        return user;
      },
    },
    profiles: {
      type: new GraphQLList(ProfileType),
      resolve: async (_, __, { prisma }: Prisma) => {
        return await prisma.profile.findMany();
      },
    },
    profile: {
      type: ProfileType,
      args: {
        id: { type: UUIDType },
      },
      resolve: async (_, { id }, { prisma }) => {
        //           console.log('+++++++++++++++ ++++++++++++ profile');
        const profile = await prisma.profile.findUnique({
          where: { id: id as string },
        });
        return profile;
      },
    },
  }),
});
