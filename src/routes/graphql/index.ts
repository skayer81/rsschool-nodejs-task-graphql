import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
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
import { MemberTypeId } from '../member-types/schemas.js';

const MemberTypeIdEnum = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    BASIC: { value: 'BASIC' },
    BUSINESS: { value: 'BUSINESS' },
  },
});

const MemberType = new GraphQLObjectType({
  // id                 String @id
  // discount           Float
  // postsLimitPerMonth Int

  // profiles Profile[]
  name: 'MemberType',
  fields: () => ({
    id: { type: GraphQLString },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
    //  profiles: { type: new GraphQLList(ProfileType) },
  }),
});

const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: GraphQLString },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  }),
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: { type: ProfileType },
    posts: { type: new GraphQLList(PostType) },

    // profile          Profile?
    // posts            Post[]
    // userSubscribedTo SubscribersOnAuthors[] @relation("subscriber")
    // subscribedToUser SubscribersOnAuthors[] @relation("author")
  }),
});

// const SubscribersOnAuthorsType = new GraphQLObjectType({
//   name: 'SubscribersOnAuthors',
//   fields: () => ({
//     id: { type: GraphQLString },
//     name: { type: GraphQLString },
//     subscribedToUser: { type: GraphQLFloat },
//     // profile: { type: ProfileType },
//     // posts: { type: new GraphQLList(PostType) },
//   }),
// });

// model SubscribersOnAuthors {
//   subscriber   User   @relation("subscriber", fields: [subscriberId], references: [id], onDelete: Cascade)
//   subscriberId String
//   author       User   @relation("author", fields: [authorId], references: [id], onDelete: Cascade)
//   authorId     String

//   @@id([subscriberId, authorId])
// }

const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: GraphQLString },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    // user: { type: UserType },
    memberType: { type: MemberType },
    memberTypeId: { type: MemberTypeIdEnum },
    // user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
    // userId       String     @unique
    // memberType   MemberType @relation(fields: [memberTypeId], references: [id], onDelete: Restrict)
    // memberTypeId String
  }),
});

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },

    async handler(req) {
      const { query, variables } = req.body;

      console.log(query);
      console.log(variables);
      const queryType = new GraphQLObjectType({
        name: 'Query',
        fields: () => ({
          memberTypes: {
            type: new GraphQLList(MemberType),
            resolve: async (_, { memberTypeId }) => {
              return await prisma.memberType.findMany({});
            },
          },
          memberType: {
            type: MemberType,
            args: {
              id: { type: MemberTypeIdEnum },
            },
            resolve: async (_, { id }) => {
              console.log('+++++++++++++++ ++++++++++++ memberType');
              const memberType = await prisma.memberType.findUnique({
                where: { id: id as string },
              });
              return memberType;
            },
          },
          posts: {
            type: new GraphQLList(PostType),
            resolve: async () => {
              return await prisma.post.findMany();
            },
          },
          post: {
            type: PostType,
            args: {
              id: { type: UUIDType },
            },
            resolve: async (_, { id }) => {
              console.log('+++++++++++++++ ++++++++++++ post');
              const post = await prisma.post.findUnique({
                where: { id: id as string },
              });
              return post;
            },
          },
          users: {
            type: new GraphQLList(UserType),
            resolve: async () => {
              return await prisma.user.findMany({
                include: {
                  profile: {
                    include: {
                      memberType: true,
                    },
                  },
                  posts: true,
                },
              });
            },
          },
          user: {
            type: UserType,
            args: {
              id: { type: UUIDType },
            },
            resolve: async (_, { id }) => {
              console.log('++++++++++++++++++++++user');
              // const user = await prisma.user.findUnique({
              //   where: { id: id as string },
              // });
              const user = await prisma.user.findUnique({
                where: { id: id },
                include: {
                  profile: {
                    include: {
                      memberType: true,
                    },
                  },
                  posts: true,
                },
              });
              console.log('++++++++++++++++++++++user');
              console.log(user);
              return user;
            },
          },
          profiles: {
            type: new GraphQLList(ProfileType),
            resolve: async () => {
              return await prisma.profile.findMany();
            },
          },
          profile: {
            type: ProfileType,
            args: {
              id: { type: UUIDType },
            },
            resolve: async (_, { id }) => {
              console.log('+++++++++++++++ ++++++++++++ profile');
              const profile = await prisma.profile.findUnique({
                where: { id: id as string },
              });
              return profile;
            },
          },
        }),
      });

      const schemaTest = new GraphQLSchema({ query: queryType });

      try {
        const result = await graphql({
          schema: schemaTest,
          source: query,
          variableValues: variables,
        });
        console.log('---------------------результат');
        //  console.log(JSON.stringify(result, null, 2));
        //  console.log('---------------------результат конец');
        return result;
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
        // throw new Error('Ошибка при выполнении запроса');
      }
    },
  });
};

export default plugin;
