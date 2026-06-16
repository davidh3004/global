/**
 * Script para poblar la base de datos de Firebase con datos de ejemplo
 * 
 * Uso:
 * 1. Configura las variables de entorno en .env
 * 2. Ejecuta: pnpm tsx scripts/seedDatabase.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, setDoc, doc } from 'firebase/firestore';

// Configuración de Firebase (usa las mismas variables de entorno)
const firebaseConfig = {
  apiKey: process.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedDatabase() {
  console.log('🌱 Iniciando seed de la base de datos...\n');

  try {
    // 1. Crew Members
    console.log('📝 Creando crew members...');
    const crewMembers = [
      {
        name: 'Max Sanchez',
        title: 'CEO & Founder',
        imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
        order: 1,
      },
      {
        name: 'Denise Sanchez',
        title: 'Co-Owner',
        imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
        order: 2,
      },
    ];

    for (const member of crewMembers) {
      await addDoc(collection(db, 'crew'), member);
    }
    console.log('✅ Crew members creados\n');

    // 2. Team Members
    console.log('📝 Creando team members...');
    const teamMembers = [
      {
        name: 'John Smith',
        title: 'Operations Manager',
        imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
        order: 1,
      },
      {
        name: 'Maria Garcia',
        title: 'Site Supervisor',
        imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
        order: 2,
      },
    ];

    for (const member of teamMembers) {
      await addDoc(collection(db, 'team'), member);
    }
    console.log('✅ Team members creados\n');

    // 3. Reviews
    console.log('📝 Creando reviews...');
    const reviews = [
      {
        author: 'Bo Z.',
        rating: 5,
        content: 'Very nice location! I recycled some granite counter tops there on Saturday. Great staff, they helped me unload, I was in and out. Will go there again in the future!',
        date: new Date(),
        isApproved: true,
      },
      {
        author: 'Steenie S.',
        rating: 5,
        content: 'Great location, staff is helpful, fast and easy. Will definitely continue to use them when I need to recycle.',
        date: new Date(),
        isApproved: true,
      },
      {
        author: 'Anthony C.',
        rating: 5,
        content: 'Great place to dump concrete and asphalt. Easy to get in and out. One of the best recycling businesses in the bay area. Great people and fair pricing.',
        date: new Date(),
        isApproved: true,
      },
    ];

    for (const review of reviews) {
      await addDoc(collection(db, 'reviews'), review);
    }
    console.log('✅ Reviews creadas\n');

    // 4. Service Areas
    console.log('📝 Creando service areas...');
    const serviceAreas = [
      { area: 'Tampa', order: 1 },
      { area: 'St. Petersburg', order: 2 },
      { area: 'Clearwater', order: 3 },
      { area: 'Brandon', order: 4 },
      { area: 'Riverview', order: 5 },
      { area: 'Plant City', order: 6 },
    ];

    for (const area of serviceAreas) {
      await addDoc(collection(db, 'serviceAreas'), area);
    }
    console.log('✅ Service areas creadas\n');

    // 5. Four Trades
    console.log('📝 Creando four trades...');
    const fourTrades = [
      {
        serviceName: 'Crushed Concrete',
        description: 'High-quality recycled concrete for roads, driveways, and construction projects.',
        icon: 'concrete',
        features: ['LBR over 150', 'Graded 2" minus', 'Ideal for roadways'],
        priceRange: '$18-25/ton',
        callToAction: 'Get Quote',
        isActive: true,
        order: 1,
      },
      {
        serviceName: 'Recycled Asphalt',
        description: 'Premium recycled asphalt perfect for driveways and parking lots.',
        icon: 'asphalt',
        features: ['Pre-screened', 'Cost-effective', 'Eco-friendly'],
        priceRange: '$15-20/ton',
        callToAction: 'Get Quote',
        isActive: true,
        order: 2,
      },
    ];

    for (const trade of fourTrades) {
      await addDoc(collection(db, 'fourTrades'), trade);
    }
    console.log('✅ Four trades creados\n');

    // 6. FAQs
    console.log('📝 Creando FAQs...');
    const faqs = [
      {
        question: '¿Qué tipos de materiales reciclan?',
        answer: 'Reciclamos concreto, asfalto y agregados. Convertimos estos materiales en productos de alta calidad para construcción.',
        category: 'General',
        order: 1,
      },
      {
        question: '¿Ofrecen servicio de entrega?',
        answer: 'Sí, ofrecemos tanto recogida en sitio como entrega a domicilio en toda el área de Tampa Bay.',
        category: 'Servicios',
        order: 2,
      },
      {
        question: '¿Cuál es su horario de atención?',
        answer: 'Estamos abiertos de lunes a sábado de 7:00am a 5:00pm. Cerrado los domingos.',
        category: 'General',
        order: 3,
      },
    ];

    for (const faq of faqs) {
      await addDoc(collection(db, 'faqs'), faq);
    }
    console.log('✅ FAQs creadas\n');

    // 7. Site Config (documento único)
    console.log('📝 Creando site config...');
    const siteConfig = {
      companyName: 'Global Recycling of Tampa Bay',
      address: '5011 N. Clark St., Tampa, FL 33614',
      phone: '(813) 373-6467',
      email: 'info@globalrecyclingtb.com',
      googleRating: '4.3',
      homesServed: '10,000+',
      emergencyService: '24/7',
      satisfaction: '100%',
      socialMedia: [
        { platform: 'Instagram', url: 'https://instagram.com/globalrecyclingtb', icon: 'instagram' },
        { platform: 'Facebook', url: 'https://facebook.com/globalrecyclingtb', icon: 'facebook' },
        { platform: 'Twitter', url: 'https://twitter.com/globalrecyclingtb', icon: 'twitter' },
      ],
      heroBackgroundImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80',
      heroTitle: {
        es: 'El Mundo Es Tuyo. Recíclalo.',
        en: 'The World Is Yours. Recycle It.',
      },
      heroSubtitle: {
        es: 'Materiales reciclados de concreto, asfalto y agregados para carreteras, entradas y proyectos de construcción. Sirviendo a Tampa Bay por más de 34 años.',
        en: 'Recycled concrete, asphalt, and aggregate materials for roads, driveways, and construction projects. Serving Tampa Bay for 34+ years.',
      },
    };

    await setDoc(doc(db, 'siteConfig', 'main'), siteConfig);
    console.log('✅ Site config creado\n');

    console.log('🎉 ¡Seed completado exitosamente!\n');
    console.log('📊 Resumen:');
    console.log(`   - ${crewMembers.length} crew members`);
    console.log(`   - ${teamMembers.length} team members`);
    console.log(`   - ${reviews.length} reviews`);
    console.log(`   - ${serviceAreas.length} service areas`);
    console.log(`   - ${fourTrades.length} four trades`);
    console.log(`   - ${faqs.length} FAQs`);
    console.log(`   - 1 site config\n`);

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Ejecutar seed
seedDatabase();
