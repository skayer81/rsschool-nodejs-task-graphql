import { MemberTypeId } from '../member-types/schemas.js';
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
import { UUIDType } from './types/uuid.js';

export const MemberTypeIdEnum = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    BASIC: { value: 'BASIC' },
    BUSINESS: { value: 'BUSINESS' },
  },
});

export const MemberType = new GraphQLObjectType({
  // id                 String @id
  // discount           Float
  // postsLimitPerMonth Int

  // profiles Profile[]
  name: 'MemberType',
  fields: () => ({
    id: { type: GraphQLString },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
    // profiles: {
    //   type: new GraphQLList(ProfileType),
    //   resolve: async (memberType, _, { prisma }) => {
    //     return await prisma.profile.findMany({ where: { memberTypeId: memberType.id } });
    //   },
    // },
    // profiles: {
    //   type: new GraphQLList(ProfileType),
    //   resolve: async (memberType, _, { prisma }) => {
    //     return await prisma.profile.findMany({ where: { memberTypeId: memberType.id } });
    //   },
    // },
    profiles: { type: new GraphQLList(ProfileType) },
  }),
});

export const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: GraphQLString },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    // author: {
    //   type: UserType,
    //   resolve: async(),
    // },
    authorId: { type: GraphQLString },

    // author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)
    // authorId String
  }),
});

export const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: { type: ProfileType },
    posts: { type: new GraphQLList(PostType) },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async (user, _, { prisma }) => {
        //   console.log('+++++++++++получаю userSubscribedTo +++++++++++++');
        const subscriptions = await prisma.subscribersOnAuthors.findMany({
          where: { subscriberId: user.id },
          include: {
            author: true,
          },
        });
        //   console.log('Подписки:', subscriptions);
        return subscriptions.map((sub) => sub.author);
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async (user, _, { prisma }) => {
        // console.log('+++++++++++получаю subscribedToUser  +++++++++++++');
        const subscriptions = await prisma.subscribersOnAuthors.findMany({
          where: { authorId: user.id },
          include: {
            subscriber: true,
          },
        });
        //   console.log('Подписчики:', subscriptions);
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
    //author: { type: UserType },
    subscribedToUser: { type: GraphQLFloat },
  }),
});

// model SubscribersOnAuthors {
//   subscriber   User   @relation("subscriber", fields: [subscriberId], references: [id], onDelete: Cascade)
//   subscriberId String
//   author       User   @relation("author", fields: [authorId], references: [id], onDelete: Cascade)
//   authorId     String

//   @@id([subscriberId, authorId])
// }

export const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: GraphQLString },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    // user: { type: UserType },
    userId: { type: GraphQLString },

    // memberType: {
    //   type: MemberType,
    //   resolve: async (memberTypeId, { _ }, { prisma }) => {
    //     await prisma.memberType.findUnique({ where: { memberTypeId: memberTypeId.id } }); // profile.findMany({ where: { memberTypeId: memberType.id } });
    //   },
    // },
    // memberType: {
    //   type: MemberType,
    //   resolve: async (profile, _, { prisma }) => {
    //     return await prisma.memberType.findUnique({
    //       where: { id: profile.memberTypeId },
    //     });
    //   },
    // },
    memberType: {
      type: MemberType,
      resolve: async (profile, _, { prisma }) => {
        // return '123';
        //   console.log('+++++++++++получаю  MemberType +++++++++++++');
        //  try {
        const memberType = await prisma.memberType.findUnique({
          where: { id: profile.memberTypeId },
        });
        // } catch (error) {
        //    console.log(error);
        //  }
        //  console.log(memberType);
        return memberType;
        //  console.log('+++++++++++полуили  MemberType +++++++++++++');
      },
    },
    memberTypeId: { type: MemberTypeIdEnum },
    // user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
    // userId       String     @unique
    // memberType   MemberType @relation(fields: [memberTypeId], references: [id], onDelete: Restrict)
    // memberTypeId String
  }),
});
