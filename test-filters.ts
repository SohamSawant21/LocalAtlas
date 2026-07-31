import { fetchCommunityPosts } from './src/actions/community';

async function main() {
  const resAll = await fetchCommunityPosts(undefined, 10, undefined, undefined, ['TRAVEL_TIP', 'ALERT', 'ROUTE_UPDATE'] as any);
  console.log("All (Excluding Utility):", resAll.posts.length, "posts. Categories:", [...new Set(resAll.posts.map(p => p.category))]);

  const resTips = await fetchCommunityPosts(undefined, 10, ['TRAVEL_TIP', 'ALERT', 'ROUTE_UPDATE'] as any);
  console.log("Tips (Including Utility):", resTips.posts.length, "posts. Categories:", [...new Set(resTips.posts.map(p => p.category))]);
}

main().catch(console.error);
