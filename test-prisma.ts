import prisma from './src/lib/prisma';

async function main() {
  const category = ['TRAVEL_TIP', 'ALERT', 'ROUTE_UPDATE'];
  const excludeCategories = undefined;
  
  const where = {
        ...(category 
            ? Array.isArray(category) 
              ? { category: { in: category } }
              : { category } 
            : {}),
        ...(excludeCategories && (excludeCategories as any).length > 0
            ? { category: { notIn: excludeCategories } }
            : {})
  };
  
  console.log("Where clause:", JSON.stringify(where, null, 2));

  const posts = await prisma.communityPost.findMany({
    where,
    select: { id: true, category: true, title: true }
  });

  console.log("Found posts:", posts.length);
  console.log("Categories found:", [...new Set(posts.map(p => p.category))]);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
