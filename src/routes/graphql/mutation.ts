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
import { CreatePostInput, CreateProfileInput, CreateUserInput } from './mutationType.js';

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
      resolve: async (_, { dto }, { prisma }) => {
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
      resolve: async (_, { dto }, { prisma }) => {
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
      resolve: async (_, { dto }, { prisma }) => {
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
      // type: PostType,
      type: GraphQLString,
      args: {
        id: { type: UUIDType },
      },
      resolve: async (_, { id }, { prisma }: Prisma) => {
        console.log('post');
        const post = await prisma.post.delete({
          where: { id: id },
        });
        console.log('post', post);
        return 'post';
      },
    },
    deleteProfile: {
      // type: ProfileType,
      type: GraphQLString,
      args: {
        id: { type: UUIDType },
      },
      resolve: async (_, { id }, { prisma }: Prisma) => {
        console.log('profile');
        const profile = await prisma.profile.delete({
          where: { id: id },
        });
        console.log('profile', profile);
        return 'profile';
      },
    },
    deleteUser: {
      //type: UserType,
      type: GraphQLString,
      // type: null,
      args: {
        id: { type: UUIDType },
      },
      resolve: async (_, { id }, { prisma }: Prisma) => {
        console.log('user');
        const user = await prisma.user.delete({
          where: { id: id },
        });
        console.log('user', user);
        return 'user';
      },
    },
  }),
});

// deletePost(id: $postId)
// deleteProfile(id: $profileId)
// deleteUser(id: $userId)

// test/routes/gql-mutations.test.js 1> mutation ($postDto: CreatePostInput!, $userDto: CreateUserInput!, $profileDto: CreateProfileInput!) {
//     test/routes/gql-mutations.test.js 1>         createPost(dto: $postDto) {
//     test/routes/gql-mutations.test.js 1>             id
//     test/routes/gql-mutations.test.js 1>         }
//     test/routes/gql-mutations.test.js 1>         createUser(dto: $userDto) {
//     test/routes/gql-mutations.test.js 1>             id
//     test/routes/gql-mutations.test.js 1>         }
//     test/routes/gql-mutations.test.js 1>         createProfile(dto: $profileDto) {
//     test/routes/gql-mutations.test.js 1>             id
//     test/routes/gql-mutations.test.js 1>         }
//     test/routes/gql-mutations.test.js 1>     }
//     test/routes/gql-mutations.test.js 1> {
//     test/routes/gql-mutations.test.js 1>   userDto: { name: '4d4989ba-72cb-42e7-acd3-2a67e02a76c4', balance: 67.946 },
//     test/routes/gql-mutations.test.js 1>   postDto: {
//     test/routes/gql-mutations.test.js 1>     authorId: '037c3abd-a68b-4787-9ffd-78bfef2ecbe5',
//     test/routes/gql-mutations.test.js 1>     content: '7e241aa9-1725-4712-af6f-008fa7e059d3',
//     test/routes/gql-mutations.test.js 1>     title: 'dc987cfb-3944-436f-85af-bc8b571069b5'
//     test/routes/gql-mutations.test.js 1>   },
//     test/routes/gql-mutations.test.js 1>   profileDto: {
//     test/routes/gql-mutations.test.js 1>     userId: '037c3abd-a68b-4787-9ffd-78bfef2ecbe5',
//     test/routes/gql-mutations.test.js 1>     memberTypeId: 'BUSINESS',
//     test/routes/gql-mutations.test.js 1>     isMale: true,
//     test/routes/gql-mutations.test.js 1>     yearOfBirth: 1994
//     test/routes/gql-mutations.test.js 1>   }
//     test/routes/gql-mutations.test.js 1> }
