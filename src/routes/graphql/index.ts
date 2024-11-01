import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, validate, parse } from 'graphql';

import schema from './schema.js';
import depthLimit from 'graphql-depth-limit';
import {
  createMemberTypeLoader,
  createPostLoader,
  createSubscribedToUserLoader,
  createUserSubscribedToLoader,
} from './loaders.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  //prisma.user.create({})

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

      // console.log(query);
      // console.log(variables);

      // const schemaTest = new GraphQLSchema({ query: queryType });

      try {
        const validationErrors = validate(schema, parse(query), [depthLimit(5)]);
        if (validationErrors.length > 0) {
          return {
            errors: validationErrors,
          };
        }

        const postLoader = createPostLoader(prisma);
        const memberTypeLoader = createMemberTypeLoader(prisma);

        const userSubscribedToLoader = createUserSubscribedToLoader(prisma);
        const subscribedToUserLoader = createSubscribedToUserLoader(prisma);

        // const result = await graphql({
        //   schema: schema,
        //   source: query,
        //   variableValues: variables,
        //   contextValue: { prisma, dataloaders: { postLoader } },
        // });

        const result = await graphql({
          schema: schema,
          source: query,
          variableValues: variables,
          contextValue: {
            prisma,
            dataloaders: {
              postLoader,
              memberTypeLoader,
              userSubscribedToLoader,
              subscribedToUserLoader,
            },
          },
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
