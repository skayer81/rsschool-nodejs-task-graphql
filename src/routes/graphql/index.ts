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
import { queryType } from './query.js';

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

      //   console.log(query);
      //   console.log(variables);

      const schemaTest = new GraphQLSchema({ query: queryType });

      try {
        const result = await graphql({
          schema: schemaTest,
          source: query,
          variableValues: variables,
          contextValue: { prisma },
        });
        // console.log('---------------------результат');
        // console.log(JSON.stringify(result, null, 2));
        // console.log('---------------------результат конец');
        return result;
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
        // throw new Error('Ошибка при выполнении запроса');
      }
    },
  });
};

export default plugin;
