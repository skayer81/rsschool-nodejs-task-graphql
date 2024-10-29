import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import {
  graphql,
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';

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
      //  const query = req.body.query;

      console.log(query);
      console.log(variables);
      const queryType = new GraphQLObjectType({
        name: 'Query',
        fields: () => ({
          memberTypes: {
            type: new GraphQLList(MemberType),
            description: 'Returns a list of member types',
            resolve: async () => {
              return await prisma.memberType.findMany();
            },
          },
          posts: {
            type: new GraphQLList(PostType),
            description: 'Returns a list of posts',
            resolve: async () => {
              return await prisma.post.findMany();
            },
          },
          users: {
            type: new GraphQLList(UserType),
            description: 'Returns a list of users',
            resolve: async () => {
              return await prisma.user.findMany();
            },
          },
          profiles: {
            type: new GraphQLList(ProfileType),
            description: 'Returns a list of profiles',
            resolve: async () => {
              return await prisma.profile.findMany();
            },
          },
        }),
      });

      const schemaTest = new GraphQLSchema({ query: queryType });

      try {
        const result = await graphql({
          schema: schemaTest,
          source: query,
        });
        //   console.log(JSON.stringify(result, null, 2));
        return result;
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
        throw new Error('Ошибка при выполнении запроса');
      }
    },
  });
};

export default plugin;
