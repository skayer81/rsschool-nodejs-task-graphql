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
  name: 'MemberType',
  fields: () => ({
    id: { type: GraphQLString },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
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
  }),
});

const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: GraphQLString },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
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
              const post = await prisma.post.findUnique({
                where: { id: id as string },
              });
              return post;
            },
          },
          users: {
            type: new GraphQLList(UserType),
            resolve: async () => {
              return await prisma.user.findMany();
            },
          },
          user: {
            type: UserType,
            args: {
              id: { type: UUIDType },
            },
            resolve: async (_, { id }) => {
              const post = await prisma.user.findUnique({
                where: { id: id as string },
              });
              return post;
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
              const post = await prisma.profile.findUnique({
                where: { id: id as string },
              });
              return post;
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
        //        console.log(JSON.stringify(result, null, 2));
        console.log('---------------------результат конец');
        return result;
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
        throw new Error('Ошибка при выполнении запроса');
      }
    },
  });
};

export default plugin;
