import { MemberType, Post, PrismaClient, User } from '@prisma/client';
import DataLoader from 'dataloader';

export const createPostLoader = (prisma: PrismaClient) => {
  return new DataLoader<string, Post[]>(async (ids) => {
    const posts = await prisma.post.findMany({
      where: { authorId: { in: ids as string[] } },
    });

    const postsMap = new Map<string, Post[]>();
    posts.forEach((post) => {
      if (!postsMap.has(post.authorId)) {
        postsMap.set(post.authorId, []);
      }
      postsMap.get(post.authorId)?.push(post);
    });
    return ids.map((id) => postsMap.get(id) || []);
  });
};

export const createMemberTypeLoader = (prisma: PrismaClient) => {
  return new DataLoader<string, MemberType | null>(async (memberTypeIds) => {
    const memberTypes = await prisma.memberType.findMany({
      where: { id: { in: memberTypeIds as string[] } },
    });

    const memberTypesMap = new Map<string, MemberType>();
    memberTypes.forEach((memberType) => {
      memberTypesMap.set(memberType.id, memberType);
    });
    console.log('memberTypeIds:', memberTypeIds);
    return memberTypeIds.map((id) => memberTypesMap.get(id) || null);
  });
};

export const createUserSubscribedToLoader = (prisma: PrismaClient) => {
  return new DataLoader<string, User[]>(async (ids) => {
    const subscriptions = await prisma.subscribersOnAuthors.findMany({
      where: { subscriberId: { in: ids as string[] } },
      include: {
        author: true,
      },
    });

    const subscriptionsMap = new Map<string, User[]>();
    subscriptions.forEach((sub) => {
      if (!subscriptionsMap.has(sub.subscriberId)) {
        subscriptionsMap.set(sub.subscriberId, []);
      }
      subscriptionsMap.get(sub.subscriberId)?.push(sub.author);
    });

    return ids.map((id) => subscriptionsMap.get(id) || []);
  });
};

export const createSubscribedToUserLoader = (prisma: PrismaClient) => {
  return new DataLoader<string, User[]>(async (ids) => {
    const subscriptions = await prisma.subscribersOnAuthors.findMany({
      where: { authorId: { in: ids as string[] } },
      include: {
        subscriber: true,
      },
    });

    const subscriptionsMap = new Map<string, User[]>();
    subscriptions.forEach((sub) => {
      if (!subscriptionsMap.has(sub.authorId)) {
        subscriptionsMap.set(sub.authorId, []);
      }

      subscriptionsMap.get(sub.authorId)?.push(sub.subscriber);
    });

    return ids.map((id) => subscriptionsMap.get(id) || []);
  });
};

export const createUserLoader = (prisma: PrismaClient) => {
  return new DataLoader<string, User | null>(async (ids) => {
    const user = await prisma.user.findMany({
      where: { id: { in: ids as string[] } },
      include: {
        userSubscribedTo: true,
        subscribedToUser: true,
      },
    });

    const memberTypesMap = new Map<string, User>();
    user.forEach((user) => {
      memberTypesMap.set(user.id, user);
    });
    return ids.map((id) => memberTypesMap.get(id) || null);
  });
};
