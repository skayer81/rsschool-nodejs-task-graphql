import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { MemberType, Post, PrismaClient, User } from '@prisma/client';
import { UUID } from 'crypto';
import DataLoader from 'dataloader';

type Prisma = {
  prisma: PrismaClient;
};

type Context = {
  dataloaders: {
    postLoader: DataLoader<string, Post[]>;
    userSubscribedToLoader: DataLoader<string, User[]>;
    subscribedToUserLoader: DataLoader<string, User[]>;
    memberTypeLoader: DataLoader<string, MemberType | null>;
  };
};
export const MemberTypeIdEnum = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    BASIC: { value: 'BASIC' },
    BUSINESS: { value: 'BUSINESS' },
  },
});

export const MemberTypeType: GraphQLObjectType = new GraphQLObjectType({
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
      resolve: async (source: { id: string }, _, context: Context) => {
        const id = source.id;
        return await context.dataloaders.postLoader.load(id);
      },
    },

    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async (source, _, context) => {
        const id = source.id;
        return await context.dataloaders.userSubscribedToLoader.load(id);
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async (source, args, context) => {
        const id = source.id;
        return await context.dataloaders.subscribedToUserLoader.load(id);
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
      type: MemberTypeType,
      resolve: async (source: { memberTypeId: string }, _, context: Context) => {
        const id = source.memberTypeId;

        return await context.dataloaders.memberTypeLoader.load(id);
      },
    },
    memberTypeId: { type: MemberTypeIdEnum },
  }),
});
