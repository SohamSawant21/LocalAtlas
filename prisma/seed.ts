import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Upsert users
  const user1 = await prisma.user.upsert({
    where: { email: 'ramesh@example.com' },
    update: {},
    create: {
      id: 'user1',
      name: 'Ramesh K.',
      email: 'ramesh@example.com',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGgZXvtgG5j6aVLw6JIyDDoXEwHVpL4wjZNSdTRe0woo7FTNy2XGewdGh4OPkr0TVdhvTXlSnnBEHvNXpDuyszvBNgomH01p7QOZdgMFqDPmZg1aDTSH4sMnq62JFKy4nZ2P6pnV2s8LtL_9En2pD3kl8192w2efIJJHD5eqb8gminGW59lzhXuNBMfUcqSqxPY-anpLd72dyn3sR9SgF6gor0UXEMShfZsJUdMH5IevwSJMrB_HEgRg76wsppw5ouqpQpoMM1p6E',
      bio: 'Expert in hidden waterfalls',
      location: 'Sindhudurg, India',
      role: 'USER',
      reputation: 4.8,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'priya@example.com' },
    update: {},
    create: {
      id: 'user2',
      name: 'Priya S.',
      email: 'priya@example.com',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMJLG59pGHjeagNEFYeNA_oD_B1gZxR4wlyVORb5MixI6pNrjZ7U4-MPwSF-zo78kkUvbOl5c1IyHJwJXTOib0E840n-Xwh1pvaGdGSw8_gZubhpTaODCopb7VYuL5BWdkNSE9DqGD7jj57LuI-cyAk0KZ5IOEyiJyGNLC_zS9xI78XvvFW9gYQqstyt0YO6iOwoSE5LKwW3Y560uU6I6TmTcoD3oe96C7l5fKbjh-G8wtPXfMojI6Tsl1KrGWPA9eqIFr3RCDmLw',
      bio: 'Culinary trail enthusiast',
      location: 'Ratnagiri, India',
      role: 'USER',
      reputation: 4.5,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'user3@example.com' },
    update: {},
    create: {
      id: 'user3',
      name: 'Anjali V.',
      email: 'user3@example.com',
      avatar: 'https://i.pravatar.cc/150?u=user3',
      bio: 'Heritage lover',
      location: 'Sindhudurg, India',
      role: 'USER',
      reputation: 3.9,
    },
  });

  // Upsert Locations
  const loc1 = await prisma.location.upsert({
    where: { slug: 'secret-devkund-falls' },
    update: {},
    create: {
      id: '1',
      name: 'Secret Devkund Falls',
      slug: 'secret-devkund-falls',
      description: 'A breathtaking misty viewpoint offering panoramic vistas of the dense valleys below.',
      district: 'SINDHUDURG',
      category: 'WATERFALL',
      latitude: 16.234,
      longitude: 73.541,
      hiddenScore: 9.5,
      crowdLevel: 'LOW',
      difficulty: 'MODERATE',
      roadCondition: 'FAIR',
      bestSeason: 'MONSOON',
      entryFee: 'None',
      parking: 'Limited near the trail head',
      network: 'None',
      accessibility: 'Not wheelchair accessible',
      bestTime: 'Early morning',
      safety: 'Slippery during monsoon',
      verified: true,
      verificationCount: 24,
      status: 'APPROVED',
      tags: ['Waterfall', 'Trekking', 'Nature'],
      images: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBOfK1n061BbsQTPfDdzYSKCNoIYJ-U-fjAsZmd5lVdjvmqo818tyVII9Oli4w7m3YgV3VEvuynCVmu9XeopBvtBc9YgfLDTxUB3VAUA7e4FqraCSowEvF59Ocn_j4v1ANVePng9azsug_IbO_tYRn1-xzEfmbdB96yHJLk6dkItbW2UAAE-SV_DiYv4Rm5YVqCxe4xb11faqLqn-vMcsqjjnC4Vly16xM5RXXJ34zbtfp8bANm9FX4eQimt8HQFpKruygDUdAflMg'
      ],
      userId: user1.id,
    }
  });

  const loc2 = await prisma.location.upsert({
    where: { slug: 'amboli-ghat-viewpoint' },
    update: {},
    create: {
      id: '2',
      name: 'Amboli Ghat Viewpoint',
      slug: 'amboli-ghat-viewpoint',
      description: 'A breathtaking misty viewpoint offering panoramic vistas of the dense valleys below.',
      district: 'RATNAGIRI',
      category: 'VIEWPOINT',
      latitude: 15.962,
      longitude: 74.004,
      hiddenScore: 8.0,
      crowdLevel: 'MEDIUM',
      difficulty: 'EASY',
      roadCondition: 'GOOD',
      bestSeason: 'MONSOON',
      parking: 'Ample parking available',
      network: 'Partial',
      accessibility: 'Accessible',
      bestTime: 'Sunset',
      sunset: '6:30 PM',
      safety: 'Safe',
      verified: true,
      verificationCount: 124,
      status: 'APPROVED',
      tags: ['Viewpoint', 'Misty', 'Monsoon'],
      images: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAsliNavI-3SLE_Rlq7_MsDygjlGMCha6FmfnnJqoGiDxmStT3VHpqAWtSnB3oVq5-143LPibH2vxeO4CAaMAfOZgS8I2fA62fuinTNhx2i8ljUlo6RyCwIvFU2n3VYuTBrHk6PsZQ7F1feLbIzFJddFGIuusfuB6N7dDR5unbW6jVGsV54PBRAfdFUzEsKNinNixgIAXQ0jpFvAHub2_TnBNOc-liM0t0I1vJPySyfKjVLPKOF68_0odoaSoIgyPp6XaKA8yLL0YU'
      ],
      userId: user2.id,
    }
  });

  await prisma.location.upsert({
    where: { slug: 'sawantwadi-heritage-stay' },
    update: {},
    create: {
      id: '3',
      name: 'Sawantwadi Heritage Stay',
      slug: 'sawantwadi-heritage-stay',
      description: 'Experience authentic coastal hospitality in this restored 100-year-old laterite stone villa.',
      district: 'SINDHUDURG',
      category: 'HOMESTAY',
      latitude: 15.901,
      longitude: 73.820,
      hiddenScore: 7.5,
      crowdLevel: 'LOW',
      difficulty: 'EASY',
      roadCondition: 'EXCELLENT',
      bestSeason: 'WINTER',
      entryFee: 'Booking Required',
      parking: 'Private Parking',
      network: 'Good',
      accessibility: 'Mostly Accessible',
      bestTime: 'Anytime',
      safety: 'Safe',
      verified: true,
      verificationCount: 88,
      status: 'APPROVED',
      tags: ['Heritage', 'Stay', 'Culture'],
      images: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBUICgLmsF2rWiYOXXM3qVMwnBbnE3Vt_TLZ6OCwgjvVz9hN47vBNzWxoku8n5MUNa1S4r8PlpuJVs2d__zJy3QRStut4nz5-0lTJgHqEp6EIR_u4A2iAuZc3Q6H3UV9QmnUBBo6T_Ojk2Bz5WEFwlCyK9Ss7s-RviPLIWp4Yy_2T64vLI_MeXkDDzvpAKelHxnqUZPtYwgJGylyk5NxvF3ybG8D_mUEeWWhOQKnah54zQ1k0s-1c1B9-q3IS2Qs4Wwxe39pcjOHX8'
      ],
      userId: user3.id,
    }
  });

  await prisma.location.upsert({
    where: { slug: 'secret-coves-sindhudurg' },
    update: {},
    create: {
      id: '4',
      name: 'Secret Coves of Sindhudurg',
      slug: 'secret-coves-sindhudurg',
      description: 'Discover untouched beaches and crystal clear waters hidden from the main tourist trails.',
      district: 'SINDHUDURG',
      category: 'BEACH',
      latitude: 16.035,
      longitude: 73.475,
      hiddenScore: 9.8,
      crowdLevel: 'VERY_LOW',
      difficulty: 'EASY',
      roadCondition: 'FAIR',
      bestSeason: 'WINTER',
      entryFee: 'None',
      parking: 'Roadside',
      network: 'Poor',
      accessibility: 'Not Accessible',
      bestTime: 'Sunset',
      sunset: '6:15 PM',
      safety: 'Beware of strong currents',
      verified: true,
      verificationCount: 45,
      status: 'APPROVED',
      tags: ['Beach', 'Hidden', 'Sunset'],
      images: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDLE1uQCrpVejVZrsETUWxDdrliMSCOrzOiHBbzJKEcyPge_Yombw8I6lmbSYdzBwfUL5OR_Iq-Qcy6BqQOOxD3mnBhshzKFdyfooyJB7r1aqoYxxVI3oLk1am1U9BFG4fsJ81f1paFjG6tvMjq04l8E96q_ctZvAQB39QxbVVmSMvZVHB8u8fadfM20fLO99jemK2Go9j9qeONGkUC0JkfKk82dyjZ9wPr_KvAu02Nq7GMu9OeZDIbj1et-fwMA_dHrMs9YGy7hIY'
      ],
      userId: user1.id,
    }
  });

  // Stories
  await prisma.story.upsert({
    where: { id: 's1' },
    update: {},
    create: {
      id: 's1',
      title: 'A Weekend at Secret Devkund',
      content: 'The mist was clearing up as we reached the hidden viewpoint...',
      coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOfK1n061BbsQTPfDdzYSKCNoIYJ-U-fjAsZmd5lVdjvmqo818tyVII9Oli4w7m3YgV3VEvuynCVmu9XeopBvtBc9YgfLDTxUB3VAUA7e4FqraCSowEvF59Ocn_j4v1ANVePng9azsug_IbO_tYRn1-xzEfmbdB96yHJLk6dkItbW2UAAE-SV_DiYv4Rm5YVqCxe4xb11faqLqn-vMcsqjjnC4Vly16xM5RXXJ34zbtfp8bANm9FX4eQimt8HQFpKruygDUdAflMg',
      locationId: '1',
      userId: user1.id,
      published: true,
    }
  });

  // Notifications
  await prisma.notification.upsert({
    where: { id: 'n1' },
    update: {},
    create: {
      id: 'n1',
      type: 'LIKE',
      title: 'New Like',
      message: 'Priya S. liked your location Secret Devkund Falls.',
      read: false,
      userId: user1.id,
      actorId: user2.id,
    }
  });

  // Trips
  const trip1 = await prisma.trip.upsert({
    where: { id: 't1' },
    update: {},
    create: {
      id: 't1',
      name: 'Monsoon Konkan Drive',
      description: 'A 3-day itinerary covering waterfalls and viewpoints.',
      userId: user1.id,
    }
  });

  // Trip Locations
  await prisma.tripLocation.upsert({
    where: { id: 'tl1' },
    update: {},
    create: {
      id: 'tl1',
      tripId: trip1.id,
      locationId: loc1.id,
      order: 1,
      notes: 'Start early morning'
    }
  });

  await prisma.tripLocation.upsert({
    where: { id: 'tl2' },
    update: {},
    create: {
      id: 'tl2',
      tripId: trip1.id,
      locationId: loc2.id,
      order: 2,
      notes: 'Stop for lunch here'
    }
  });

  // Reviews
  await prisma.review.upsert({
    where: { id: 'r1' },
    update: {},
    create: {
      id: 'r1',
      content: 'Absolutely stunning! The trek is a bit slippery but totally worth it.',
      rating: 5,
      locationId: loc1.id,
      userId: user2.id,
    }
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
