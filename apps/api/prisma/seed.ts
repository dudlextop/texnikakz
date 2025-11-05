import { PrismaClient, Prisma, ListingStatus, DealType, SellerType, SpecialistAvailability, PromotionType, SpecialistPromotionType } from '@prisma/client';

const prisma = new PrismaClient();

const regionsSeed = [
  { id: 'almaty', name: 'Алматы', slug: 'almaty' },
  { id: 'astana', name: 'Астана', slug: 'astana' },
  { id: 'shymkent', name: 'Шымкент', slug: 'shymkent' },
  { id: 'karaganda', name: 'Карагандинская область', slug: 'karaganda' },
  { id: 'aktobe', name: 'Актюбинская область', slug: 'aktobe' },
  { id: 'atyrau', name: 'Атырауская область', slug: 'atyrau' },
  { id: 'mangystau', name: 'Мангистауская область', slug: 'mangystau' },
  { id: 'kostanay', name: 'Костанайская область', slug: 'kostanay' },
  { id: 'zhambyl', name: 'Жамбылская область', slug: 'zhambyl' },
  { id: 'pavlodar', name: 'Павлодарская область', slug: 'pavlodar' },
  { id: 'turkistan', name: 'Туркестанская область', slug: 'turkistan' },
  { id: 'east-kazakhstan', name: 'Восточно-Казахстанская область', slug: 'east-kazakhstan' },
  { id: 'north-kazakhstan', name: 'Северо-Казахстанская область', slug: 'north-kazakhstan' }
];

const citiesSeed = [
  { id: 'almaty-city', name: 'Алматы', slug: 'almaty-city', regionId: 'almaty' },
  { id: 'astana-city', name: 'Астана', slug: 'astana-city', regionId: 'astana' },
  { id: 'shymkent-city', name: 'Шымкент', slug: 'shymkent-city', regionId: 'shymkent' },
  { id: 'karaganda-city', name: 'Караганда', slug: 'karaganda-city', regionId: 'karaganda' },
  { id: 'temirtau', name: 'Темиртау', slug: 'temirtau', regionId: 'karaganda' },
  { id: 'aktobe-city', name: 'Актобе', slug: 'aktobe-city', regionId: 'aktobe' },
  { id: 'atyrau-city', name: 'Атырау', slug: 'atyrau-city', regionId: 'atyrau' },
  { id: 'aktau', name: 'Актау', slug: 'aktau', regionId: 'mangystau' },
  { id: 'kostanay-city', name: 'Костанай', slug: 'kostanay-city', regionId: 'kostanay' },
  { id: 'kokshetau', name: 'Кокшетау', slug: 'kokshetau', regionId: 'north-kazakhstan' },
  { id: 'petropavl', name: 'Петропавловск', slug: 'petropavl', regionId: 'north-kazakhstan' },
  { id: 'pavlodar-city', name: 'Павлодар', slug: 'pavlodar-city', regionId: 'pavlodar' },
  { id: 'ekibastuz', name: 'Экибастуз', slug: 'ekibastuz', regionId: 'pavlodar' },
  { id: 'taraz', name: 'Тараз', slug: 'taraz', regionId: 'zhambyl' },
  { id: 'turkistan-city', name: 'Туркестан', slug: 'turkistan-city', regionId: 'turkistan' },
  { id: 'semey', name: 'Семей', slug: 'semey', regionId: 'east-kazakhstan' },
  { id: 'oskemen', name: 'Өскемен', slug: 'oskemen', regionId: 'east-kazakhstan' },
  { id: 'ridder', name: 'Риддер', slug: 'ridder', regionId: 'east-kazakhstan' },
  { id: 'kulsary', name: 'Кульсары', slug: 'kulsary', regionId: 'atyrau' },
  { id: 'zhanaozen', name: 'Жанаозен', slug: 'zhanaozen', regionId: 'mangystau' }
];

const categoriesSeed = [
  { id: 'excavators', name: 'Экскаваторы', description: 'Гусеничные и колесные экскаваторы' },
  { id: 'loaders', name: 'Погрузчики', description: 'Фронтальные и вилочные погрузчики' },
  { id: 'cranes', name: 'Краны', description: 'Авто- и башенные краны' },
  { id: 'bulldozers', name: 'Бульдозеры', description: 'Тяжелые бульдозеры для земляных работ' },
  { id: 'tractors', name: 'Трактора', description: 'Сельхоз и промышленная техника' },
  { id: 'dump-trucks', name: 'Самосвалы', description: 'Карьерные и дорожные самосвалы' },
  { id: 'trailers', name: 'Прицепы', description: 'Низкорамные и специальные прицепы' },
  { id: 'road-rollers', name: 'Катки', description: 'Дорожные катки и уплотнители' },
  { id: 'graders', name: 'Грейдеры', description: 'Автогрейдеры и планировщики' },
  { id: 'other', name: 'Другое', description: 'Дополнительная спецтехника' }
];

const dealerSeed = [
  {
    name: 'KazTech Machinery',
    slug: 'kaztech-machinery',
    description: 'Официальный дистрибьютор строительной техники по всему Казахстану',
    innIin: '990640001234',
    website: 'https://kaztech.example.kz',
    addresses: [
      { city: 'Алматы', address: 'пр. Сейфуллина, 502', phone: '+77272550010' }
    ],
    plan: 'PRO'
  },
  {
    name: 'Steppe Heavy Dealers',
    slug: 'steppe-heavy-dealers',
    description: 'Поставка карьерной техники, сервис 24/7',
    innIin: '960940008765',
    website: 'https://steppeheavy.example.kz',
    addresses: [
      { city: 'Караганда', address: 'ул. Горняков, 18', phone: '+77212770044' }
    ],
    plan: 'ENTERPRISE'
  },
  {
    name: 'Nomad Rental Group',
    slug: 'nomad-rental-group',
    description: 'Аренда дорожной и коммунальной техники',
    innIin: '030440002233',
    website: 'https://nomadrental.example.kz',
    addresses: [
      { city: 'Астана', address: 'ул. Кабанбай батыра, 15/1', phone: '+77172560123' }
    ],
    plan: 'PRO'
  },
  {
    name: 'Caspian Lift Alliance',
    slug: 'caspian-lift-alliance',
    description: 'Крановый парк и грузоперевозки по западному региону',
    innIin: '050540007654',
    website: 'https://caspianlift.example.kz',
    addresses: [
      { city: 'Атырау', address: 'пр. Азаттык, 94', phone: '+77122450007' }
    ],
    plan: 'FREE'
  }
];

const specialistRoles = [
  'Оператор крана',
  'Экскаваторщик',
  'Бульдозерист',
  'Тракторист',
  'Водитель самосвала',
  'Механик по спецтехнике',
  'Оператор/машинист спецтехники'
];

const availabilityOptions = [
  SpecialistAvailability.FULL_TIME,
  SpecialistAvailability.PART_TIME,
  SpecialistAvailability.SHIFT,
  SpecialistAvailability.TRAVEL
];

const listingStatuses = [
  ListingStatus.PUBLISHED,
  ListingStatus.PUBLISHED,
  ListingStatus.PENDING,
  ListingStatus.DRAFT,
  ListingStatus.PUBLISHED,
  ListingStatus.PUBLISHED
];

const dealTypes = [DealType.SALE, DealType.RENT, DealType.LEASING];

const listingDescriptors = ['Надежный', 'Проверенный', 'Готов к работе', 'После капитального ремонта', 'С минимальным пробегом'];
const listingConditions = ['Полный комплект документов', 'Гарантия от дилера', 'Доступна доставка', 'Проведен свежий ТО'];

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function randomFrom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

async function resetDatabase() {
  await prisma.auditLog.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.specialistPromotion.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.media.deleteMany();
  await prisma.order.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.specialist.deleteMany();
  await prisma.user.deleteMany();
  await prisma.dealer.deleteMany();
  await prisma.category.deleteMany();
  await prisma.city.deleteMany();
  await prisma.region.deleteMany();
}

async function seedReferenceData() {
  const regions = [] as Awaited<ReturnType<typeof prisma.region.create>>[];
  for (const region of regionsSeed) {
    regions.push(
      await prisma.region.create({
        data: region
      })
    );
  }

  const cities = [] as Awaited<ReturnType<typeof prisma.city.create>>[];
  for (const city of citiesSeed) {
    cities.push(
      await prisma.city.create({
        data: city
      })
    );
  }

  const categories = [] as Awaited<ReturnType<typeof prisma.category.create>>[];
  for (const category of categoriesSeed) {
    categories.push(
      await prisma.category.create({
        data: category
      })
    );
  }

  return { regions, cities, categories };
}

async function seedDealersAndUsers() {
  const dealers = [] as Awaited<ReturnType<typeof prisma.dealer.create>>[];
  for (const dealer of dealerSeed) {
    dealers.push(
      await prisma.dealer.create({
        data: {
          name: dealer.name,
          slug: dealer.slug,
          description: dealer.description,
          innIin: dealer.innIin,
          website: dealer.website,
          plan: dealer.plan as Prisma.DealerPlan,
          addresses: dealer.addresses,
          logoKey: null
        }
      })
    );
  }

  const users: Awaited<ReturnType<typeof prisma.user.create>>[] = [];

  // Create dealer admin users
  for (let i = 0; i < dealers.length; i++) {
    const dealer = dealers[i];
    const user = await prisma.user.create({
      data: {
        phone: `+77011000${(i + 1).toString().padStart(2, '0')}`,
        email: `dealer${i + 1}@texnika.kz`,
        firstName: dealer.name.split(' ')[0] ?? 'Dealer',
        lastName: 'Manager',
        role: 'DEALER',
        dealerId: dealer.id,
        isVerified: true
      }
    });
    users.push(user);
  }

  // Create moderators
  for (let i = 0; i < 2; i++) {
    users.push(
      await prisma.user.create({
        data: {
          phone: `+77012000${(i + 1).toString().padStart(2, '0')}`,
          email: `moderator${i + 1}@texnika.kz`,
          firstName: 'Texnika',
          lastName: 'Moderator',
          role: i === 0 ? 'ADMIN' : 'MODERATOR',
          isVerified: true
        }
      })
    );
  }

  // General marketplace users
  for (let i = 0; i < 60; i++) {
    users.push(
      await prisma.user.create({
        data: {
          phone: `+770130${(1000 + i).toString()}`,
          firstName: 'Пользователь',
          lastName: `${i + 1}`,
          role: 'USER',
          isVerified: i % 2 === 0
        }
      })
    );
  }

  return { dealers, users };
}

async function seedSpecialists(data: {
  users: Awaited<ReturnType<typeof prisma.user.create>>[];
  categories: Awaited<ReturnType<typeof prisma.category.create>>[];
  cities: Awaited<ReturnType<typeof prisma.city.create>>[];
}) {
  const specialists: Awaited<ReturnType<typeof prisma.specialist.create>>[] = [];

  for (let i = 0; i < 50; i++) {
    const baseUser = data.users[(i + 5) % data.users.length];
    const category = data.categories[i % data.categories.length];
    const city = data.cities[i % data.cities.length];
    const regionId = city.regionId;
    const role = specialistRoles[i % specialistRoles.length];
    const availability = availabilityOptions[i % availabilityOptions.length];
    const experienceYears = 3 + (i % 12);
    const hourly = new Prisma.Decimal(7000 + i * 120);

    const specialist = await prisma.specialist.create({
      data: {
        userId: baseUser.id,
        categoryId: category.id,
        profession: role,
        title: `${role} — ${city.name}`,
        bio: `${role} с опытом ${experienceYears} лет. Работал на крупных объектах и знает стандарты безопасности.`,
        phone: baseUser.phone,
        experienceYears,
        rateHourly: hourly,
        rateShift: hourly.mul(10),
        rateMonthly: hourly.mul(22),
        availability,
        hasOwnEquipment: i % 3 === 0,
        certifications: {
          documents: [
            {
              name: 'Удостоверение оператора спецтехники',
              issuedBy: 'КазЦСМ',
              year: 2018 + (i % 5)
            }
          ]
        },
        regionsServed: {
          primary: regionId,
          travel: [randomFrom(regionsSeed).id]
        },
        skills: [
          'Соблюдение техники безопасности',
          'Техническое обслуживание',
          `Опыт с брендом ${['Komatsu', 'Caterpillar', 'Liebherr', 'Doosan'][i % 4]}`
        ],
        languages: i % 4 === 0 ? ['ru', 'kk'] : ['ru'],
        rating: 4.2 + (i % 5) * 0.1,
        reviewsCount: 0,
        regionId,
        cityId: city.id,
        portfolio: {
          create: [
            {
              kind: 'IMAGE',
              bucket: 'specialists',
              objectKey: `specialists/${slugify(role)}-${i + 1}/photo-1.jpg`,
              url: `https://cdn.texnika.kz/specialists/${slugify(role)}-${i + 1}/photo-1.jpg`,
              previewUrl: `https://cdn.texnika.kz/specialists/${slugify(role)}-${i + 1}/preview-1.jpg`
            },
            {
              kind: 'IMAGE',
              bucket: 'specialists',
              objectKey: `specialists/${slugify(role)}-${i + 1}/photo-2.jpg`,
              url: `https://cdn.texnika.kz/specialists/${slugify(role)}-${i + 1}/photo-2.jpg`,
              previewUrl: `https://cdn.texnika.kz/specialists/${slugify(role)}-${i + 1}/preview-2.jpg`
            }
          ]
        }
      }
    });

    specialists.push(specialist);
  }

  // Seed reviews for subset of specialists
  for (let i = 0; i < specialists.length; i++) {
    const specialist = specialists[i];
    const reviewers = data.users.slice(i, i + 3);
    let totalRating = 0;
    let count = 0;

    for (const reviewer of reviewers) {
      const rating = 4 + ((i + count) % 2);
      await prisma.review.create({
        data: {
          specialistId: specialist.id,
          reviewerId: reviewer.id,
          rating,
          comment: `Профессионализм на высоком уровне, ${rating >= 5 ? 'работа выполнена досрочно' : 'работа выполнена в срок'}.`
        }
      });
      totalRating += rating;
      count += 1;
    }

    await prisma.specialist.update({
      where: { id: specialist.id },
      data: {
        rating: count > 0 ? totalRating / count : specialist.rating,
        reviewsCount: count
      }
    });

    if (i % 8 === 0) {
      await prisma.specialistPromotion.create({
        data: {
          specialistId: specialist.id,
          type: [
            SpecialistPromotionType.VIP,
            SpecialistPromotionType.TOP,
            SpecialistPromotionType.HIGHLIGHT
          ][i % 3],
          startsAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          meta: { source: 'seed', priority: 'high' }
        }
      });
    }
  }

  return specialists;
}

async function seedListings(data: {
  users: Awaited<ReturnType<typeof prisma.user.create>>[];
  dealers: Awaited<ReturnType<typeof prisma.dealer.create>>[];
  categories: Awaited<ReturnType<typeof prisma.category.create>>[];
  cities: Awaited<ReturnType<typeof prisma.city.create>>[];
}) {
  const listings: Awaited<ReturnType<typeof prisma.listing.create>>[] = [];

  for (let i = 0; i < 150; i++) {
    const category = data.categories[i % data.categories.length];
    const status = listingStatuses[i % listingStatuses.length];
    const dealType = dealTypes[i % dealTypes.length];
    const city = data.cities[(i * 3) % data.cities.length];
    const regionId = city.regionId;
    const baseUser = data.users[(i * 2) % data.users.length];
    const assignedDealer = i % 4 === 0 ? data.dealers[i % data.dealers.length] : null;
    const ownerUser = assignedDealer
      ? data.users.find((u) => u.dealerId === assignedDealer.id) ?? baseUser
      : baseUser;

    const title = `${listingDescriptors[i % listingDescriptors.length]} ${category.name.toLowerCase()} ${i + 1}`;
    const slug = `${slugify(category.id)}-${i + 1}`;
    const description = [
      `${title}. Подходит для крупномасштабных проектов.`,
      randomFrom(listingConditions),
      'Проверен технической службой Texnika.kz'
    ].join(' ');

    const price = new Prisma.Decimal(8000000 + (i % 60) * 550000 + Math.floor(Math.random() * 200000));

    const listing = await prisma.listing.create({
      data: {
        status,
        dealType,
        categoryId: category.id,
        title,
        slug,
        description,
        priceKzt: price,
        priceCurrency: 'KZT',
        regionId,
        cityId: city.id,
        latitude: 43.2 + Math.random(),
        longitude: 76.8 + Math.random(),
        sellerType: assignedDealer ? SellerType.DEALER : SellerType.PRIVATE,
        userId: ownerUser.id,
        dealerId: assignedDealer?.id,
        params: {
          condition: i % 5 === 0 ? 'after_overhaul' : 'excellent',
          hours: 500 + (i % 200) * 10,
          year: 2010 + (i % 13),
          nds: i % 3 === 0,
          payload: 10 + (i % 20)
        },
        specs: {
          engine: ['Cummins', 'Perkins', 'Deutz', 'Caterpillar'][i % 4],
          attachments: ['ковш', 'гидромолот', 'вилы'][i % 3]
        },
        contactMasked: '+7 (701) ***-**-**',
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        publishedAt: status === ListingStatus.PUBLISHED ? new Date(Date.now() - (i % 15) * 24 * 60 * 60 * 1000) : null,
        boostScore: assignedDealer ? 1.2 : 0.6,
        media: {
          create: Array.from({ length: 3 }).map((_, mediaIndex) => ({
            kind: 'IMAGE',
            bucket: 'listings',
            objectKey: `listings/${slug}/photo-${mediaIndex + 1}.jpg`,
            url: `https://cdn.texnika.kz/listings/${slug}/photo-${mediaIndex + 1}.jpg`,
            previewUrl: `https://cdn.texnika.kz/listings/${slug}/preview-${mediaIndex + 1}.jpg`
          }))
        }
      }
    });

    listings.push(listing);

    if (i % 10 === 0) {
      await prisma.promotion.create({
        data: {
          listingId: listing.id,
          type: [PromotionType.VIP, PromotionType.TOP, PromotionType.HIGHLIGHT, PromotionType.AUTOBUMP][i % 4],
          startsAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          endsAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
          meta: { seed: true, weight: i % 4 === 0 ? 2.0 : 1.5 }
        }
      });
    }
  }

  return listings;
}

async function seedConversations(data: {
  listings: Awaited<ReturnType<typeof prisma.listing.create>>[];
  specialists: Awaited<ReturnType<typeof prisma.specialist.create>>[];
  users: Awaited<ReturnType<typeof prisma.user.create>>[];
}) {
  for (let i = 0; i < 20; i++) {
    const listing = data.listings[(i * 3) % data.listings.length];
    const specialist = data.specialists[(i * 2) % data.specialists.length];
    const buyer = data.users[(i + 10) % data.users.length];
    const sellerUserId = listing.userId;

    await prisma.conversation.create({
      data: {
        listingId: listing.id,
        specialistId: i % 2 === 0 ? specialist.id : null,
        buyerId: buyer.id,
        sellerId: sellerUserId,
        messages: {
          create: [
            {
              senderId: buyer.id,
              body: `Здравствуйте! Интересует техника ${listing.title}. Доступна ли на ${new Date().toLocaleDateString('ru-RU')}?`
            },
            {
              senderId: sellerUserId,
              body: 'Здравствуйте! Да, можем организовать показ и тест-драйв завтра.'
            },
            {
              senderId: buyer.id,
              body: 'Отлично, давайте согласуем время в чате.'
            }
          ]
        }
      }
    });
  }
}

async function main() {
  console.info('Resetting database...');
  await resetDatabase();

  console.info('Seeding reference data...');
  const { cities, categories } = await seedReferenceData();

  console.info('Seeding dealers and users...');
  const { dealers, users } = await seedDealersAndUsers();

  console.info('Seeding specialists...');
  const specialists = await seedSpecialists({ users, categories, cities });

  console.info('Seeding listings...');
  const listings = await seedListings({ users, dealers, categories, cities });

  console.info('Seeding conversations & messages...');
  await seedConversations({ listings, specialists, users });

  console.info('Seed data generated successfully.');
}

main()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
