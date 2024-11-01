import DataLoader from 'dataloader';

export const createPostLoader = (prisma) => {
  return new DataLoader(async (ids) => {
    const posts = await prisma.post.findMany({
      where: { authorId: { in: ids } },
    });

    const postsMap = new Map();
    posts.forEach((post) => {
      if (!postsMap.has(post.authorId)) {
        postsMap.set(post.authorId, []);
      }
      postsMap.get(post.authorId).push(post);
    });
    return ids.map((id) => postsMap.get(id) || []);
  });
};

export const createMemberTypeLoader = (prisma) => {
  return new DataLoader(async (memberTypeIds) => {
    const memberTypes = await prisma.memberType.findMany({
      where: { id: { in: memberTypeIds } },
    });

    const memberTypesMap = new Map();
    memberTypes.forEach((memberType) => {
      if (!memberTypesMap.has(memberType.id)) {
        memberTypesMap.set(memberType.id, []);
      }
      memberTypesMap.set(memberType.id, memberType);
    });
    console.log('memberTypeIds:', memberTypeIds);
    return memberTypeIds.map((id) => memberTypesMap.get(id) || null);
  });
};

export const createUserSubscribedToLoader = (prisma) => {
  return new DataLoader(async (ids) => {
    const subscriptions = await prisma.subscribersOnAuthors.findMany({
      where: { subscriberId: { in: ids } },
      include: {
        author: true,
      },
    });

    const subscriptionsMap = new Map();
    subscriptions.forEach((sub) => {
      if (!subscriptionsMap.has(sub.subscriberId)) {
        subscriptionsMap.set(sub.subscriberId, []);
      }
      subscriptionsMap.get(sub.subscriberId).push(sub.author);
    });

    return ids.map((id) => subscriptionsMap.get(id) || []);
  });
};

export const createSubscribedToUserLoader = (prisma) => {
  return new DataLoader(async (ids) => {
    const subscriptions = await prisma.subscribersOnAuthors.findMany({
      where: { authorId: { in: ids } },
      include: {
        subscriber: true,
      },
    });

    const subscriptionsMap = new Map();
    subscriptions.forEach((sub) => {
      if (!subscriptionsMap.has(sub.authorId)) {
        subscriptionsMap.set(sub.authorId, []);
      }
      subscriptionsMap.get(sub.authorId).push(sub.subscriber);
    });

    return ids.map((id) => subscriptionsMap.get(id) || []);
  });
};
