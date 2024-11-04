import { GraphQLObjectType, GraphQLString } from 'graphql';
import { UUIDType } from './types/uuid.js';
import { PostType, ProfileType, UserType } from './queryTypes.js';
import { PrismaClient } from '@prisma/client';
import {
  ChangePostInput,
  ChangePostInputType,
  ChangeProfileInput,
  ChangeProfileInputType,
  ChangeUserInput,
  ChangeUserInputType,
  CreatePostInput,
  CreateProfileInput,
  CreateUserInput,
} from './mutationType.js';
import { UUID } from 'crypto';

type Prisma = {
  prisma: PrismaClient;
};

export const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    createPost: {
      type: PostType,
      args: {
        dto: { type: CreatePostInput },
      },
      resolve: async (
        _,
        { dto }: { dto: { authorId: UUID; content: string; title: string } },
        { prisma }: Prisma,
      ) => {
        return await prisma.post.create({
          data: {
            authorId: dto.authorId,
            content: dto.content,
            title: dto.title,
          },
        });
      },
    },

    createUser: {
      type: UserType,
      args: {
        dto: { type: CreateUserInput },
      },
      resolve: async (
        _,
        { dto }: { dto: { name: string; balance: number } },
        { prisma }: Prisma,
      ) => {
        return await prisma.user.create({
          data: {
            name: dto.name,
            balance: dto.balance,
          },
        });
      },
    },
    createProfile: {
      type: ProfileType,
      args: {
        dto: { type: CreateProfileInput },
      },
      resolve: async (
        _,
        {
          dto,
        }: {
          dto: {
            userId: UUID;
            memberTypeId: string;
            isMale: boolean;
            yearOfBirth: number;
          };
        },
        { prisma }: Prisma,
      ) => {
        return await prisma.profile.create({
          data: {
            userId: dto.userId,
            memberTypeId: dto.memberTypeId,
            isMale: dto.isMale,
            yearOfBirth: dto.yearOfBirth,
          },
        });
      },
    },
    deletePost: {
      type: GraphQLString,
      args: {
        id: { type: UUIDType },
      },
      resolve: async (_, { id }: { id: UUID }, { prisma }: Prisma) => {
        const post = await prisma.post.delete({
          where: { id: id },
        });
        return 'post';
      },
    },
    deleteProfile: {
      type: GraphQLString,
      args: {
        id: { type: UUIDType },
      },
      resolve: async (_, { id }: { id: UUID }, { prisma }: Prisma) => {
        const profile = await prisma.profile.delete({
          where: { id: id },
        });
        return 'profile';
      },
    },
    deleteUser: {
      type: GraphQLString,

      args: {
        id: { type: UUIDType },
      },
      resolve: async (_, { id }: { id: UUID }, { prisma }: Prisma) => {
        const user = await prisma.user.delete({
          where: { id: id },
        });
        return 'user';
      },
    },

    changePost: {
      type: PostType,
      args: {
        id: { type: UUIDType },
        dto: { type: ChangePostInput },
      },
      resolve: async (
        _,
        { id, dto }: { id: UUID; dto: ChangePostInputType },
        { prisma }: Prisma,
      ) => {
        const updatedPost = await prisma.post.update({
          where: { id },
          data: dto,
        });

        return updatedPost;
      },
    },
    changeProfile: {
      type: ProfileType,
      args: {
        id: { type: UUIDType },
        dto: { type: ChangeProfileInput },
      },
      resolve: async (
        _,
        { id, dto }: { id: UUID; dto: ChangeProfileInputType },
        { prisma }: Prisma,
      ) => {
        const updatedProfile = await prisma.profile.update({
          where: { id },
          data: dto,
        });
        return updatedProfile;
      },
    },
    changeUser: {
      type: UserType,
      args: {
        id: { type: UUIDType },
        dto: { type: ChangeUserInput },
      },
      resolve: async (
        _,
        { id, dto }: { id: UUID; dto: ChangeUserInputType },
        { prisma }: Prisma,
      ) => {
        const updatedUser = await prisma.user.update({
          where: { id },
          data: dto,
        });
        return updatedUser;
      },
    },

    subscribeTo: {
      type: GraphQLString,
      args: {
        userId: { type: UUIDType },
        authorId: { type: UUIDType },
      },
      resolve: async (
        _,
        { userId, authorId }: { userId: UUID; authorId: UUID },
        { prisma }: Prisma,
      ) => {
        await prisma.subscribersOnAuthors.create({
          data: {
            subscriber: {
              connect: { id: userId },
            },
            author: {
              connect: { id: authorId },
            },
          },
        });
        return 'subscription';
      },
    },
    unsubscribeFrom: {
      type: GraphQLString,
      args: {
        userId: { type: UUIDType },
        authorId: { type: UUIDType },
      },
      resolve: async (
        _,
        { userId, authorId }: { userId: UUID; authorId: UUID },
        { prisma }: Prisma,
      ) => {
        await prisma.subscribersOnAuthors.delete({
          where: {
            subscriberId_authorId: {
              subscriberId: userId,
              authorId: authorId,
            },
          },
        });
        return 'unsubscribe';
      },
    },
  }),
});
